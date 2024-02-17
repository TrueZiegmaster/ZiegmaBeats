import "dotenv/config";
import { Config } from "../interfaces/Config";

let config: Config;

try {
  config = require("../config.json");
} catch (error) {
  config = {
    TOKEN: process.env.TOKEN || "",
    MAIN_GUILD: process.env.MAIN_GUILD || "",
    SR_AUTH_TOKEN: process.env.SR_AUTH_TOKEN || "",
    SR_USER_ID: parseInt(process.env.SR_USER_ID!) || null,
    MAX_PLAYLIST_SIZE: parseInt(process.env.MAX_PLAYLIST_SIZE!) || 10,
    PRUNING: process.env.PRUNING === "true" ? true : false,
    STAY_TIME: parseInt(process.env.STAY_TIME!) || 30,
    DEFAULT_VOLUME: parseInt(process.env.DEFAULT_VOLUME!) || 100,
    LOCALE: process.env.LOCALE || "en",
    RESTART_COMMAND: process.env.RESTART_COMMAND || ""
  };
}

export { config };
