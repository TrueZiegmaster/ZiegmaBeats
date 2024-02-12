import { AudioPlayerState, AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { bot } from "../index";
import { Song } from "../structs/Song";
import express from "express";
import expressSession from "express-session";
import expressWs from "express-ws";
import WebSocket from "ws";

export default function srServer(guildId: string): void {
  const app = express();

  app.use(
    expressSession({
      secret: "18e9d1a3e96dc0a1f943fb933d885485",
      resave: true,
      saveUninitialized: true
    })
  );

  const subscribers = new Map<string, WebSocket>();

  expressWs(app);

  const router = express.Router();

  router.ws("/", (ws, req) => {
    ws.on("message", (msg) => {
      const data: Record<string, string> = JSON.parse(String(msg));
      if (data.command === "subscribe") {
        subscribers.set(req.sessionID, ws);
        ws.send(
          JSON.stringify({
            id: req.sessionID,
            message: "You are subscribed!"
          })
        );
      }
    });
    ws.on("close", () => {
      subscribers.delete(req.sessionID);
    });
  });

  app.use("/", router);

  app.listen(8100, () => {
    setInterval(async () => {
      const queue = bot.queues.get(guildId);
      let song: Song | undefined;
      let elapsed;
      let playing = false;
      if (queue) {
        const res = (
          queue?.player.state as
            | (AudioPlayerState & {
                resource: AudioResource | undefined;
              })
            | undefined
        )?.resource;
        song = res?.metadata as Song | undefined;
        elapsed = res?.playbackDuration ? ~~(queue.resource.playbackDuration / 1000) : undefined;
        playing = queue.player.state.status === AudioPlayerStatus.Playing;
      }
      for (const [_id, subscriber] of subscribers.entries()) {
        subscriber.send(JSON.stringify({ ...song, elapsed, playing }));
      }
    }, 1000);
  });
}
