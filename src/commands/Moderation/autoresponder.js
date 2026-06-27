import { Events } from 'discord.js';

export default {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        if (content === "!texturepack" || content === "!texture pack") {
            return message.reply({
                content: "📦 You can find the latest texture pack here: <#1520081010056757318>"
            });
        }
    }
};
