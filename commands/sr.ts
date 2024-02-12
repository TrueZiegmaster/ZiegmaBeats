import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { i18n } from "../utils/i18n";
import { MusicQueue } from "../structs/MusicQueue";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { bot } from "..";

export default {
  data: new SlashCommandBuilder()
    .setName("sr")
    .setDescription(i18n.__mf("sr.description"))
    .addBooleanOption((option) => option.setName("mode").setDescription(i18n.__mf("sr.mode")).setRequired(true))
    .addUserOption((option) => option.setName("user").setDescription(i18n.__mf("sr.user")).setRequired(false)),
  cooldown: 10,
  async execute(interaction: ChatInputCommandInteraction) {
    const mode: boolean = interaction.options.getBoolean("mode")!;
    const user = interaction.options.getUser("user");

    const guildMember = interaction.guild!.members.cache.get(user?.id ?? interaction.user.id);
    const { channel } = guildMember!.voice;

    let queue = bot.queues.get(interaction.guild!.id);

    if (mode) {
      if (channel) {
        if (!queue) {
          queue = new MusicQueue({
            interaction,
            textChannel: interaction.channel! as TextChannel,
            connection: joinVoiceChannel({
              channelId: channel.id,
              guildId: channel.guild.id,
              adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
            })
          });
          queue.srMode = true;
          bot.queues.set(interaction.guild!.id, queue);
          queue.processQueue();
        } else {
          queue.srMode = true;
        }
        return interaction.reply({ content: i18n.__("sr.enabled") }).catch(console.error);
      }
      return interaction.reply({ content: i18n.__("play.errorNotChannel"), ephemeral: true }).catch(console.error);
    } else {
      if (queue) {
        queue.srMode = false;
        return interaction.reply({ content: i18n.__("sr.disabled") }).catch(console.error);
      }
      return interaction.reply({ content: i18n.__("sr.errorNotQueue"), ephemeral: true }).catch(console.error);
    }
  }
};
