import { Message } from "discord.js";
import { RawMessageData } from "discord.js/typings/rawDataTypes";
import BetterClient from "./BetterClient";
import BetterGuild from "./BetterGuild";

export default class BetterMessage extends Message {
    declare public guild: BetterGuild | null
    public constructor(client: BetterClient, data: RawMessageData) {
        super(client, data);
    }
}

