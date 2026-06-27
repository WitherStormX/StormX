import { Events } from 'discord.js';

const AUTO_RESPONSES = {
    "texture pack": "Check the latest texture pack in <#1520081010056757318>!",
    };

export default {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        for (const trigger in AUTO_RESPONSES) {
            if (content.includes(trigger.toLowerCase())) {
                await message.reply({
                    content: AUTO_RESPONSES[trigger]
                });
                break;
            }
        }
    }
};
