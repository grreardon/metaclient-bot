import { Guild, Snowflake } from "discord.js";
import { RawGuildData } from "discord.js/typings/rawDataTypes";
import { guildSettings } from "../types";
import BetterClient from "./BetterClient"
import Giveaway from "../additions/Giveaway";
export default class BetterGuild extends Guild {
    declare client: BetterClient;
    public config: guildSettings
    public onCooldown: Map<Snowflake, number>;
    public giveaways: Map<Snowflake, Giveaway>
    constructor(client: BetterClient, data: RawGuildData) {
        super(client, data);
        this.config = require("../../../config.json")
        this.onCooldown = new Map<Snowflake, number>();
        this.giveaways = new Map<Snowflake, Giveaway>();
    }

    public async loadGiveaways() {
       const entries = await this.client.dataManager.dbManager.getMultiple("giveaways", {}, {});
       const array = await entries?.toArray();
       if(!array?.length) return;
      array.forEach((entry) => this.giveaways.set(entry._id.toString(), new Giveaway(this.client, entry.guild, entry.channel, entry.prize, entry._id.toString(), entry.duration, entry.currentTime, entry.winners, entry.role ? entry.role : undefined, entry.entries)))
    }
}

