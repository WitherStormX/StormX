import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { handleInteractionError } from '../../utils/errorHandler.js';

export default {
    data: new SlashCommandBuilder()
        .setName('embedmsg')
        .setDescription('Send a custom embed message')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Message to send in the embed')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const message = interaction.options.getString('message');

            const embed = createEmbed({
                title: '📢 Announcement',
                description: message
            })
                .setFooter({
                    text: `Sent by ${interaction.user.tag}`
                })
                .setTimestamp();

            await interaction.channel.send({
                embeds: [embed]
            });

            await interaction.reply({
                content: '✅ Embed message sent successfully!',
                ephemeral: true
            });

            logger.info('EmbedMsg command executed', {
                userId: interaction.user.id,
                guildId: interaction.guildId
            });

        } catch (error) {
            logger.error('EmbedMsg command failed', {
                error: error.message,
                stack: error.stack
            });

            await handleInteractionError(interaction, error, {
                commandName: 'embedmsg',
                source: 'embedmsg_command'
            });
        }
    }
};
