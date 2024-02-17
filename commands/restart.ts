import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { i18n } from "../utils/i18n";
import { config } from "../utils/config";
import { exec } from "node:child_process";

export default {
  data: new SlashCommandBuilder().setName("restart").setDescription(i18n.__mf("restart.description")),
  cooldown: 3,
  async execute(interaction: ChatInputCommandInteraction) {
    setTimeout(() => {
      exec(config.RESTART_COMMAND);
    }, 1500);
    interaction.reply({ content: i18n.__mf("restart.restarting"), ephemeral: true }).catch(console.error);
  }
};
