import Config from "../../config/config.json";
import {logger} from "../logger/logger.ts";
import {influx} from "../index.ts";
import {DataType} from "./dataType.ts";

const url = Config.weather.uri
    .replace("{latitude}", Config.weather.latitude)
    .replace("{longitude}", Config.weather.longitude);

export let currentWeatherData = {
    "time": undefined,
    "temperature": undefined,
    "humidity": undefined,
    "apparentTemperature": undefined,
    "rain": undefined,
    "showers": undefined,
    "cloudCover": undefined,
    "windSpeed": undefined,
    "windDirection": undefined
};
export let dailyWeatherData = [];
export let hourlyWeatherData = [];

export async function getWeatherStatus() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            logger.error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.current || !data.hourly) {
            logger.error("Invalid data received from the weather API");
        }

        currentWeatherData = {
            "time": data.current.time,
            "temperature": data.current.temperature_2m,
            "humidity": data.current.relative_humidity_2m,
            "apparentTemperature": data.current.apparent_temperature,
            "rain": data.current.rain,
            "showers": data.current.showers,
            "cloudCover": data.current.cloud_cover,
            "windSpeed": data.current.wind_speed_10m,
            "windDirection": data.current.wind_direction_10m
        }

        dailyWeatherData = data.daily.time.map((time: any, index: string | number) => {
            return {
                "time": time,
                "maxTemperature": data.daily.temperature_2m_max[index],
                "minTemperature": data.daily.temperature_2m_min[index],
                "maxApparentTemperature": data.daily.apparent_temperature_max[index],
                "minApparentTemperature": data.daily.apparent_temperature_min[index],
                "sunrise": data.daily.sunrise[index],
                "sunset": data.daily.sunset[index],
                "uvIndex": data.daily.uv_index_max[index],
                "rain": data.daily.rain_sum[index],
                "showers": data.daily.showers_sum[index],
                "precipitation_hours": data.daily.precipitation_hours[index],
                "precipitation_probability_max": data.daily.precipitation_probability_max[index],
                "maxWindSpeed": data.daily.wind_speed_10m_max[index],
                "dominantWindDirection": data.daily.wind_direction_10m_dominant[index]
            };
        });

        hourlyWeatherData = data.hourly.time.map((time: any, index: string | number) => {
            return {
                "time": time,
                "temperature": data.hourly.temperature_2m[index],
                "humidity": data.hourly.relative_humidity_2m[index],
                "apparentTemperature": data.hourly.apparent_temperature[index],
                "precipitation_probability": data.hourly.precipitation_probability[index],
                "rain": data.hourly.rain[index],
                "showers": data.hourly.showers[index],
                "cloudCover": data.hourly.cloud_cover[index],
                "visibility": data.hourly.visibility[index],
                "windSpeed": data.hourly.wind_speed_10m[index],
                "windDirection": data.hourly.wind_direction_10m[index],
                "uvIndex": data.hourly.uv_index[index]
            };
        });

        influx.writeWeatherData(currentWeatherData, DataType.CURRENT);
        influx.writeWeatherData(dailyWeatherData, DataType.DAILY);
        influx.writeWeatherData(hourlyWeatherData, DataType.HOURLY);
    } catch (error) {
        logger.error(`Error fetching weather data: ${error}`);
    }
}