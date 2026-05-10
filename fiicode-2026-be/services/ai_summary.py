from datetime import datetime, timezone, timedelta
from uuid import UUID

from fastapi import HTTPException
from openai import OpenAI
from sqlalchemy.orm import Session
from starlette.config import Config

from models.crisis import CrisisZone
from models.incident import IncidentReport

config = Config(".env")
OPENAI_KEY = config("OPENAI_KEY", default=None)

SUMMARY_TTL_MINUTES = 1


class AISummaryService:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_KEY) if OPENAI_KEY else None

    def get_or_generate_summary(self, zone_id: UUID, db: Session, force: bool = False) -> dict:
        zone: CrisisZone = db.query(CrisisZone).filter(CrisisZone.id == zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Crisis zone not found")

        if not force and zone.ai_summary and zone.ai_summary_updated_at:
            age = datetime.now(timezone.utc) - zone.ai_summary_updated_at.replace(tzinfo=timezone.utc)
            if age < timedelta(minutes=SUMMARY_TTL_MINUTES):
                return {
                    "summary": zone.ai_summary,
                    "updated_at": zone.ai_summary_updated_at.isoformat(),
                    "cached": True,
                }

        reports: list[IncidentReport] = (
            db.query(IncidentReport)
            .filter(IncidentReport.cluster_id == zone_id)
            .order_by(IncidentReport.created_at.desc())
            .limit(50)
            .all()
        )

        if not reports:
            summary = "No incident reports have been filed for this crisis yet. Be the first to report."
            zone.ai_summary = summary
            zone.ai_summary_updated_at = datetime.now(timezone.utc)
            db.commit()
            return {"summary": summary, "updated_at": zone.ai_summary_updated_at.isoformat(), "cached": False}

        report_lines = []
        for r in reports:
            type_name = r.incident_type.name if r.incident_type else "Unknown"
            desc = r.description or "No description"
            report_lines.append(
                f"- Type: {type_name} | Location: ({r.latitude:.4f}, {r.longitude:.4f}) | Note: {desc}"
            )

        crisis_name = zone.crisis_label or (zone.incident_type.name if zone.incident_type else "Emergency")
        prompt = (
            f"You are an emergency dispatcher AI. A '{crisis_name}' crisis is active.\n"
            f"Here are the {len(reports)} latest incident reports from the public:\n\n"
            + "\n".join(report_lines)
            + "\n\nWrite a single concise paragraph (max 3 sentences) summarising the situation for responders. "
            "Group similar incidents, mention approximate locations, and highlight the most urgent needs. "
            "Do not use bullet points. Be factual and urgent."
        )

        summary = f"AI summary temporarily unavailable. {len(reports)} reports on record."

        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=180,
                    temperature=0.3,
                )
                summary = response.choices[0].message.content.strip()
            except Exception as e:
                print(f"[AI Summary] OpenAI error: {e}")

        zone.ai_summary = summary
        zone.ai_summary_updated_at = datetime.now(timezone.utc)
        db.commit()

        return {"summary": summary, "updated_at": zone.ai_summary_updated_at.isoformat(), "cached": False}
