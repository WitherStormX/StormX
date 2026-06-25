import { SlashCommandBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { handleInteractionError } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send a message through the bot')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Message to send')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const message = interaction.options.getString('message');

            await interaction.channel.send(message);

            await interaction.reply({
                content: '✅ Message sent!',
                ephemeral: true
            });

            logger.info('Say command executed', {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                message
            });

        } catch (error) {
            logger.error('Say command failed', {
                error: error.message,
                stack: error.stack
            });

            await handleInteractionError(interaction, error, {
                commandName: 'say',
                source: 'say_command'
            });
        }
    }
};
