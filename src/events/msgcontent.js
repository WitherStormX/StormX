import { Events } from 'discord.js';

export default {
    name: Events.MessageCreate,

    async execute(message) {
        // Ignore bots
        if (message.author.bot) return;

        const content = message.content.toLowerCase().trim();

        if (content === '!texturepack' || content === '!texture pack') {
            await message.reply({
                content: '📦 **Latest Texture Pack:** <#1520081010056757318>'
            });
        }
    }
};
