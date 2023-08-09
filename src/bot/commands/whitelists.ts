import { SlashCommandBuilder } from "@discordjs/builders"
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";


export default class TestCommand extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("whitelists", new SlashCommandBuilder().setName("whitelists").setDescription("Displays the amount of whitelist spots you have"), client);
        this.client = client;
    }

    override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply({ephemeral: true})
        
        const user = await this.client.dataManager.get("users", interaction.user.id, "users");

        //@ts-ignore
        return await interaction.editReply(`You currently have ${user.whitelists || 0} whitelist spots.`)
    }
}