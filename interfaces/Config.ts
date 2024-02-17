export interface Config {
  TOKEN: string;
  MAIN_GUILD: string;
  SR_AUTH_TOKEN: string;
  SR_USER_ID: number | null;
  MAX_PLAYLIST_SIZE: number;
  PRUNING: boolean;
  STAY_TIME: number;
  DEFAULT_VOLUME: number;
  LOCALE: string;
  RESTART_COMMAND: string;
}
