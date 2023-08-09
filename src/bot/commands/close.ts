import { SlashCommandBuilder } from "@discordjs/builders"
import BaseCommand from "../../lib/additions/BaseCommand"
import BetterClient from "../../lib/extensions/BetterClient"
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";


export default class Close extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("close", new SlashCommandBuilder().setName("close").setDescription("close a ticket"), client);
        this.client = client;
    }

    override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply({ephemeral: true})
        if(!interaction.channel || !interaction.channel.id) return await interaction.editReply("")
        //@ts-ignore
        const parent = interaction.channel.parentId
        if(parent !== interaction.guild?.config.factionsCat || parent !== interaction.guild?.config.nftCat) return await interaction.editReply("This is not a ticket!")

        const messages = await interaction.channel.messages.fetch().catch(() => {}) || false;

        if(messages && messages.size) {
           const mapped = messages.map((m) => `${m.author.tag}: ${m.content} (${m.createdAt})`).join("\n")
           const buffer = Buffer.from(mapped);
           //@ts-ignore
           await this.client.logger.logTicket(buffer, interaction.channel?.name || "", interaction.user.tag);
        }

        await interaction.editReply("ok");
        await interaction.channel.delete().catch((err) => this.client.logger.logError(err, __filename))
    }
}