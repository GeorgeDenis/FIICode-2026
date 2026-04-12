import httpx
from decouple import config

from exceptions.exceptions import AppException

WEATHER_API_KEY = config("OPENWEATHER_KEY")
WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={WEATHER_API_KEY}&units=metric"


class WeatherService:
    async def get_weather_data(self, latitude: float, longitude: float):
        if latitude is None or longitude is None:
            raise AppException("Latitude and longitude are required", 400)
        # return {
        #     "coord": {
        #         "lon": 27.5941,
        #         "lat": 47.1491
        #     },
        #     "weather": [
        #         {
        #             "id": 501,
        #             "main": "Rain",
        #             "description": "moderate rain",
        #             "icon": "10d"
        #         }
        #     ],
        #     "main": {
        #         "temp": 11.6,
        #         "feels_like": 11.17,
        #         "temp_min": 11.36,
        #         "temp_max": 11.73,
        #         "pressure": 1008,
        #         "humidity": 90,
        #         "sea_level": 1008,
        #         "grnd_level": 991
        #     },
        # }
        url = WEATHER_URL.format(latitude=latitude, longitude=longitude, WEATHER_API_KEY=WEATHER_API_KEY)
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            data = response.json()
            return data
