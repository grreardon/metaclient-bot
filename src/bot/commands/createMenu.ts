import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageSelectMenu } from "discord.js";
import BaseCommand from "../../lib/additions/BaseCommand";
import BetterClient from "../../lib/extensions/BetterClient";
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";


export default class CreateMenu extends BaseCommand {
    constructor(client: BetterClient) {
        //@ts-ignore
        super("createmenu", new SlashCommandBuilder().setName("createmenu").setDescription("Creates the ticket menu"), client);
        this.client = client;
    }

    public override async execute(interaction: BetterCommandInteraction) {
        if(!interaction.memberPermissions?.has("MANAGE_GUILD")) return await interaction.reply({content: "You are missing permissions", ephemeral: true});
        if(!interaction.channel) return interaction.editReply({content: ""})
        const components = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId('tickets').setPlaceholder('Ticket Category')
        .addOptions([
            {
                label: 'NFT',
                description: 'Create a ticket for anything blockchain related',
                value: 'Nft',
            },
            {
                label: 'Factions',
                description: 'Create a ticket for any in-game problems',
                value: 'Factions',
            }]))
        await interaction.reply({content: "Create a ticket!", components: [components]})
    }
}