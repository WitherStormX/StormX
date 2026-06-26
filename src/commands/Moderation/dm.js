import { SlashCommandBuilder } from 'discord.js';
import { successEmbed, warningEmbed } from '../../utils/embeds.js';
import { logEvent } from '../../utils/moderation.js';
import { logger } from '../../utils/logger.js';
import { sanitizeMarkdown } from '../../utils/validation.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

const OWNER_ID = "1516085554779914340";

export default {
    data: new SlashCommandBuilder()
        .setName("dm")
        .setDescription("Send a direct message to a user (Owner Only)")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to send a DM to")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The message to send")
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName("anonymous")
                .setDescription("Send the message anonymously")
                .setRequired(false)
        )
        .setDMPermission(false),

    category: "moderation",

    async execute(interaction) {
        // Owner-only check
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                embeds: [
                    warningEmbed(
                        "Access Denied",
                        "❌ Only the bot owner can use this command."
                    )
                ],
                ephemeral: true
            });
        }

        const deferSuccess = await InteractionHelper.safeDefer(interaction);
        if (!deferSuccess) {
            logger.warn(`DM interaction defer failed`, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                commandName: "dm"
            });
            return;
        }

        const targetUser = interaction.options.getUser("user");
        const message = interaction.options.getString("message");
        const anonymous = interaction.options.getBoolean("anonymous") || false;

        try {
            if (message.length > 2000) {
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [
                        warningEmbed(
                            "Message Too Long",
                            "Messages must be under **2000** characters."
                        )
                    ]
                });
            }

            if (targetUser.bot) {
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [
                        warningEmbed(
                            "Invalid User",
                            "You cannot send DMs to bot accounts."
                        )
                    ]
                });
            }

            const sanitized = sanitizeMarkdown(message);

            const dmChannel = await targetUser.createDM();

            await dmChannel.send({
                embeds: [
                    successEmbed(
                        anonymous
                            ? "Message from the Staff Team"
                            : `Message from ${interaction.user.tag}`,
                        sanitized
                    ).setFooter({
                        text: `You cannot reply to this message. | Logger ID: ${interaction.id}`
                    })
                ]
            });

            await logEvent({
                client: interaction.client,
                guild: interaction.guild,
                event: {
                    action: "DM Sent",
                    target: `${targetUser.tag} (${targetUser.id})`,
                    executor: `${interaction.user.tag} (${interaction.user.id})`,
                    reason: `Anonymous: ${anonymous ? "Yes" : "No"}`,
                    metadata: {
                        userId: targetUser.id,
                        moderatorId: interaction.user.id,
                        anonymous,
                        messageLength: sanitized.length
                    }
                }
            });

            return InteractionHelper.safeEditReply(interaction, {
                embeds: [
                    successEmbed(
                        "DM Sent",
                        `✅ Successfully sent a message to **${targetUser.tag}**.`
                    )
                ]
            });

        } catch (error) {
            logger.error("DM command error:", error);

            if (error.code === 50007) {
                return InteractionHelper.safeEditReply(interaction, {
                    embeds: [
                        warningEmbed(
                            "DM Failed",
                            `❌ Could not send a DM to **${targetUser.tag}**. They may have DMs disabled.`
                        )
                    ]
                });
            }

            return InteractionHelper.safeEditReply(interaction, {
                embeds: [
                    warningEmbed(
                        "Error",
                        `❌ Failed to send DM.\n\`${error.message}\``
                    )
                ]
            });
        }
    }
};
