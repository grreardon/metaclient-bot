import BaseEvent from "../../lib/additions/BaseEvent";
import BetterClient from "../../lib/extensions/BetterClient";
import BetterMessage from "../../lib/extensions/BetterMessage";

export default class MessageCreate extends BaseEvent {
    constructor(client: BetterClient) {
        super(client, "messageCreate")
    }
    override async execute(message: BetterMessage) {
        if(message.author.bot) return;
        if(!message.guild?.onCooldown) return;
        if (!message.guild?.onCooldown.has(message.author.id) || message.guild?.onCooldown.get(message.author.id)! <= Date.now() - message.guild.config.cooldown * 1000) {
            if (message.guild.onCooldown.has(message.author.id)) {
              message.guild.onCooldown.delete(message.author.id);
            }
            message.guild.onCooldown.set(message.author.id, Date.now());
            if(!this.client.qualified.has(message.author.id)) {
            const messages = this.client.messageSent.get(message.author.id);
            if(messages && messages >= message.guild.config.messagesNeeded) {
                this.client.qualified.add(message.author.id)
            } else {
                this.client.messageSent.set(message.author.id, messages ? messages +1 : 1)
            }
            }
        }

    }
}