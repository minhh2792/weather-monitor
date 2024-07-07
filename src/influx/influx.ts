import {InfluxDB, Point, type WriteApi} from "@influxdata/influxdb-client";

import Config from "../../config/config.json";
import {logger} from "../logger/logger";
import {DataType} from "../weather/dataType.ts";

export default class Influx {
    private influx: InfluxDB;
    private writeApi: WriteApi;

    constructor() {
        logger.info("--------------------")
        logger.info("Loading influx database");

        this.influx = new InfluxDB({
            url: Config.influx.url,
            token: Config.influx.token,
        });
        this.writeApi = this.influx.getWriteApi(
            Config.influx.org,
            Config.influx.bucket,
            "s",
        );
        logger.info(`URL: ${Config.influx.url}`);
        logger.info(`Organization: ${Config.influx.org}`);
        logger.info(`Bucket: ${Config.influx.bucket}`);
        logger.info("InfluxDB initialized");
        logger.info("--------------------")
    }

    /**
     * Write a point to the database.
     *
     * @param point the point to write
     */
    public writePoint(point: Point) {
        this.writeApi.writePoint(point);
    }


    public writeWeatherData(data: any, dataType: DataType) {
        try {
            switch (dataType) {
                case DataType.CURRENT: {
                    const point = new Point("current_weather")
                        .timestamp(data.time)
                        .floatField("temperature", data.temperature)
                        .floatField("humidity", data.humidity)
                        .floatField("apparentTemperature", data.apparentTemperature)
                        .floatField("rain", data.rain)
                        .floatField("showers", data.showers)
                        .floatField("cloudCover", data.cloudCover)
                        .floatField("windSpeed", data.windSpeed)
                        .floatField("windDirection", data.windDirection);
                    this.writePoint(point);
                    logger.info("1 CURRENT weather data written to InfluxDB");
                    break;
                }

                case DataType.DAILY: {
                    let count = 0;
                    data.forEach((dailyData: any) => {
                        const point = new Point("daily_weather")
                            .timestamp(dailyData.time)
                            .floatField("maxTemperature", dailyData.maxTemperature)
                            .floatField("minTemperature", dailyData.minTemperature)
                            .floatField("maxApparentTemperature", dailyData.maxApparentTemperature)
                            .floatField("minApparentTemperature", dailyData.minApparentTemperature)
                            .intField("sunrise", dailyData.sunrise)
                            .intField("sunset", dailyData.sunset)
                            .floatField("uvIndex", dailyData.uvIndex)
                            .floatField("rain", dailyData.rain)
                            .floatField("showers", dailyData.showers)
                            .floatField("precipitation_hours", dailyData.precipitation_hours)
                            .floatField("precipitation_probability_max", dailyData.precipitation_probability_max)
                            .floatField("maxWindSpeed", dailyData.maxWindSpeed)
                            .floatField("dominantWindDirection", dailyData.dominantWindDirection);
                        this.writePoint(point);
                        count++;
                    });
                    logger.info(count + " DAILY weather data written to InfluxDB");
                    break;
                }

                case DataType.HOURLY: {
                    let count = 0;
                    data.forEach((hourlyData: any) => {
                        const point = new Point("hourly_weather")
                            .timestamp(hourlyData.time)
                            .floatField("temperature", hourlyData.temperature)
                            .floatField("humidity", hourlyData.humidity)
                            .floatField("apparentTemperature", hourlyData.apparentTemperature)
                            .floatField("precipitation_probability", hourlyData.precipitation_probability)
                            .floatField("rain", hourlyData.rain)
                            .floatField("showers", hourlyData.showers)
                            .floatField("cloudCover", hourlyData.cloudCover)
                            .floatField("visibility", hourlyData.visibility / 1000) // m -> km
                            .floatField("windSpeed", hourlyData.windSpeed)
                            .floatField("windDirection", hourlyData.windDirection)
                            .floatField("uvIndex", hourlyData.uvIndex);
                        this.writePoint(point);
                        count++;
                    });
                    logger.info(count + " HOURLY weather data written to InfluxDB")
                    break;
                }

            }
        } catch (e) {
            logger.error(e);
        }
    }

}