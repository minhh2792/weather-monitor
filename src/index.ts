import {getWeatherStatus} from "./weather/weatherRequest.ts";
import Influx from "./influx/influx.ts";
import Config from "../config/config.json";
import cron from "node-cron";
import {logger} from "./logger/logger.ts";

export const influx = new Influx();

Bun.serve({
    port: Config.app.port,
    fetch(request) {
        return new Response("I'm alive lol");
    },
});
logger.info(`Server started on port ${Config.app.port}`);
logger.info("--------------------")
getWeatherStatus();
cron.schedule(Config.weather.interval, () => {
    getWeatherStatus();
});
