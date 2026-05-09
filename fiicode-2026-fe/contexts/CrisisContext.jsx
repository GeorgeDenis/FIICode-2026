import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useLocation } from '../hooks/useLocation';
import { WS_BASE_URL } from '../services/api';
import {
  getCrisisStatus,
  getIncidentTypes,
  submitIncidentReport,
  submitCheckIn as submitCheckInApi,
  getMyCheckIn,
} from '../services/crisisService';

export const CrisisContext = createContext();

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function CrisisProvider({ children }) {
  const { user } = useUser();
  const { location } = useLocation();

  const [isCrisisActive, setIsCrisisActive] = useState(false);
  const [activeCrisis, setActiveCrisis] = useState(null);
  const [myCheckInStatus, setMyCheckInStatus] = useState(null);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const wsRef = useRef(null);

  const locationRef = useRef(location);
  const activeCrisisIdRef = useRef(null);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    activeCrisisIdRef.current = activeCrisis?.id ?? null;
  }, [activeCrisis]);

  useEffect(() => {
    if (!user) return;
    fetchIncidentTypes();
  }, [user]);

  useEffect(() => {
    if (!user || !location) return;
    refreshCrisisStatus();
  }, [user, location]);

  useEffect(() => {
    if (!user) return;

    const wsUrl = `${WS_BASE_URL}/crisis/${user.user_id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[Crisis WS] Connected');
    };

    ws.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data);
        handleWsMessage(message);
      } catch (err) {
        console.error('[Crisis WS] Parse error:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('[Crisis WS] Error:', error.message);
    };

    ws.onclose = () => {
      console.log('[Crisis WS] Disconnected');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [user]);

  const handleWsMessage = useCallback((message) => {
    switch (message.type) {
      case 'CRISIS_ACTIVATED': {
        const crisis = message.data;
        const scope = crisis?.scope;

        if (scope === 'Global') {
          setIsCrisisActive(true);
          setActiveCrisis(crisis);
          break;
        }

        const loc = locationRef.current;
        if (
          loc?.coords &&
          crisis?.center_latitude != null &&
          crisis?.center_longitude != null &&
          crisis?.radius_meters != null
        ) {
          const distKm = getDistanceKm(
            loc.coords.latitude,
            loc.coords.longitude,
            crisis.center_latitude,
            crisis.center_longitude,
          );
          const radiusKm = crisis.radius_meters / 1000;
          if (distKm <= radiusKm) {
            setIsCrisisActive(true);
            setActiveCrisis(crisis);
          }
        }
        break;
      }
      case 'CRISIS_RESOLVED':
        if (
          !activeCrisisIdRef.current ||
          activeCrisisIdRef.current === message.data?.id
        ) {
          setIsCrisisActive(false);
          setActiveCrisis(null);
          setMyCheckInStatus(null);
        }
        break;
      case 'CHECKIN_UPDATE':
        break;
      default:
        break;
    }
  }, []);

  const fetchIncidentTypes = async () => {
    try {
      const types = await getIncidentTypes();
      setIncidentTypes(types);
    } catch (error) {
      console.error('Failed to fetch incident types:', error);
    }
  };

  const refreshCrisisStatus = async () => {
    if (!location?.coords) return;
    try {
      const result = await getCrisisStatus(location.coords.latitude, location.coords.longitude);
      if (result.active) {
        setIsCrisisActive(true);
        setActiveCrisis(result.crisis);
        try {
          const checkin = await getMyCheckIn(result.crisis.id);
          if (checkin) {
            setMyCheckInStatus(checkin.status);
          }
        } catch { }
      } else {
        setIsCrisisActive(false);
        setActiveCrisis(null);
        setMyCheckInStatus(null);
      }
    } catch (error) {
      console.error('Failed to check crisis status:', error);
    }
  };

  const submitReport = async (data) => {
    return await submitIncidentReport(data);
  };

  const submitCheckIn = async (status) => {
    if (!activeCrisis || !location?.coords) return;
    try {
      const result = await submitCheckInApi({
        crisis_zone_id: activeCrisis.id,
        status: status,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setMyCheckInStatus(status);
      return result;
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      throw error;
    }
  };

  return (
    <CrisisContext.Provider
      value={{
        isCrisisActive,
        activeCrisis,
        myCheckInStatus,
        incidentTypes,
        submitReport,
        submitCheckIn,
        refreshCrisisStatus,
        fetchIncidentTypes,
      }}>
      {children}
    </CrisisContext.Provider>
  );
}
