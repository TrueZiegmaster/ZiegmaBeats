import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { i18n } from "../utils/i18n";
import { config } from "../utils/config";
import youtube, { Video } from "youtube-sr";
import { bot } from "..";
import { AudioPlayerStatus } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder()
    .setName("song_request")
    .setDescription(i18n.__mf("song_request.description"))
    .addStringOption((option) =>
      option.setName("song").setDescription(i18n.__mf("song_request.song")).setRequired(true)
    ),
  cooldown: 10,
  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("song")!;

    youtube
      .getVideo(query)
      .catch(() => youtube.search(query, { type: "video", limit: 1 }))
      .then((result: Video | Video[]) => {
        const song: Video = result instanceof Array ? result[0] : result;
        fetch(`https://api.streamersonglist.com/v1/streamers/${config.SR_USER_ID}/queue`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.SR_AUTH_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nonlistSong: song.title,
            note: `https://www.youtube.com/watch?v=${song.id}`,
            requests: [
              {
                amount: 0,
                name: interaction.member?.user.username
              }
            ]
          })
        })
          .then(async (response) => {
            if (response.status === 201) {
              const data = await response.json();
              const embed = new EmbedBuilder()
                .setTitle(song.title!)
                .setAuthor({ name: song.channel?.name!, iconURL: song.channel?.iconURL() })
                .setURL(`https://www.youtube.com/watch?v=${song.id}`)
                .setThumbnail(song.thumbnail?.url!)
                .setColor("#FF0000")
                .addFields(
                  { name: "Продолжительность", value: song.durationFormatted },
                  { name: "Код трека", value: String(data["queue"]["id"]) }
                );
              const queue = bot.queues.get(interaction.guild!.id);
              if (queue && queue.srMode && queue.player.state.status === AudioPlayerStatus.Idle) {
                queue.processQueue();
              }
              interaction.reply({ embeds: [embed] }).catch(console.error);
            } else {
              console.error(response);
              interaction.reply({ content: "Ошибка при обработке запроса", ephemeral: true }).catch(console.error);
            }
          })
          .catch((e) => {
            console.error(e);
            interaction.reply({ content: "Ошибка при обработке запроса", ephemeral: true }).catch(console.error);
          });
      })
      .catch((e) => {
        console.error(e);
        interaction.reply({ content: "Ошибка при обработке запроса", ephemeral: true }).catch(console.error);
      });
  }
};
