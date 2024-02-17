import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { i18n } from "../utils/i18n";
import { config } from "../utils/config";

export default {
  data: new SlashCommandBuilder()
    .setName("song_remove")
    .setDescription(i18n.__mf("song_remove.description"))
    .addNumberOption((option) =>
      option.setName("song_id").setDescription(i18n.__mf("song_remove.song_id")).setRequired(true)
    ),
  cooldown: 3,
  async execute(interaction: ChatInputCommandInteraction) {
    const songId = interaction.options.getNumber("song_id")!;

    await fetch(`https://api.streamersonglist.com/v1/streamers/${config.SR_USER_ID}/queue`)
      .then(async (response) => {
        const data = await response.json();
        for (let i = 0; i < data.list.length; i++) {
          if (data.list[i].id === songId) {
            let name = data.list[i].requests[0].name;
            let matches = name.match(/\((.*?)\)/);
            if (matches && matches[1] === interaction.member?.user.id) {
              return await fetch(`https://api.streamersonglist.com/v1/streamers/${config.SR_USER_ID}/queue/${songId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${config.SR_AUTH_TOKEN}`
                }
              })
                .then(async (response) => {
                  if (response.status == 200) {
                    interaction
                      .reply({
                        content: `<@${interaction.member?.user.id}> отменяет заказ трека с кодом ${songId}`,
                        ephemeral: false
                      })
                      .catch(console.error);
                  } else {
                    interaction
                      .reply({ content: "Ошибка при обработке запроса!", ephemeral: true })
                      .catch(console.error);
                  }
                })
                .catch((e) => {
                  console.error(e);
                  interaction.reply({ content: "Ошибка при обработке запроса!", ephemeral: true }).catch(console.error);
                });
            } else {
              interaction
                .reply({ content: "У вас недостаточно прав для отмены этого трека!", ephemeral: true })
                .catch(console.error);
            }
          }
        }
        interaction.reply({ content: "Такого трека нет в очереди!", ephemeral: true }).catch(console.error);
      })
      .catch((e) => {
        console.error(e);
        interaction.reply({ content: "Ошибка при обработке запроса!", ephemeral: true }).catch(console.error);
      });
  }
};
