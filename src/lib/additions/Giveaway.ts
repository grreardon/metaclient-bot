import { Guild, MessageActionRow, MessageButton, Snowflake, TextChannel } from "discord.js";
import BetterClient from "../extensions/BetterClient";
import BetterGuild from "../extensions/BetterGuild";

export default class Giveaway {
    public client: BetterClient
    public guild?: Guild
    public channel: Snowflake
    public prize :string
    public messageID: Snowflake
    public duration: number
    public currentTime: number
    public role?: Snowflake
    public entries: Set<Snowflake>
    public winners: number
    constructor(client: BetterClient, guild: Snowflake, channel: Snowflake, prize: string, messageID: Snowflake, duration: number, currentTime: number, winners: number, role?: Snowflake, entries?: Snowflake[]) {
        this.client = client;
        this.guild = this.client.guilds.cache.get(guild);
        this.channel = channel;
        this.prize = prize;
        this.messageID = messageID;
        this.duration = duration;
        this.currentTime = currentTime;
        this.winners = winners;
        if(role) this.role = role;
        if(entries) this.entries = new Set<Snowflake>(entries);
        else {
            this.entries = new Set<Snowflake>();
            if(role) this.client.dataManager.set("giveaways", {_id: this.messageID}, {duration: this.duration,guild, channel, prize: this.prize, currentTime: this.currentTime, winners: this.winners, role: this.role, entries: []}, "giveaways")
            else this.client.dataManager.set("giveaways", {_id: this.messageID}, {duration: this.duration, channel, guild, prize: this.prize, currentTime: this.currentTime, winners: this.winners, entries: []}, "giveaways")
    }
    setTimeout(async () => {("hi");await this.rollGiveaway()}, entries?.length || 0 > 0 ? duration - (Date.now() - currentTime) > 0 ? duration - (Date.now() - currentTime) : 0 : duration );
    }
    public async rollGiveaway() {
        if(!this.guild) return;
        const channel = await this.guild.channels.fetch(this.channel).catch(() => {}) || false;
        if(!channel || !(channel instanceof TextChannel)) return;
        const message = await channel.messages.fetch(this.messageID).catch((err) => this.client.logger.logError(err, __filename)) || false;
        if(!message) return;
        const randomNumbers: number[] = [];
        const winners: Snowflake[] = [];
        const entries = Array.from(this.entries.values());
        const length = this.entries.size;
        for(let i = 0; i < this.winners; i++) {
            let randomNumber = Math.round(Math.random() * (length || 1))
            while(randomNumbers.includes(randomNumber) && randomNumbers.length < length) {
                randomNumber = Math.round(Math.random() * length)
            };
            if(entries.length) winners.push(entries[randomNumber] || entries[0])
        };
        try {
        await message.reply(winners.length > 0 ? `Congrats ${winners.map((s) => `<@${s}>`).join(", ")} on winning the giveaway for \`${this.prize}\`!`: "No one entered this giveaway...");
        await message.edit({embeds: [{
            title: "Giveaway Ended",
            description: message.embeds[0].description || "",
            color: "RED"
        }], components: [new MessageActionRow().setComponents(new MessageButton().setDisabled(true).setEmoji("❌").setStyle("DANGER").setLabel("Enter").setCustomId("giveawayover"))]});
    } catch(err) {
        this.client.logger.logError(err, __filename)
    }
        await this.client.dataManager.delete("giveaways", this.messageID, "giveaways");
        (this.guild as BetterGuild).giveaways.delete(this.messageID);
    }

    public async addEntry(user: Snowflake) {
        await this.client.dataManager.set("giveaways", {_id: this.messageID}, {entries: Array.from(this.entries.add(user))}, "giveaways");
    }
}
