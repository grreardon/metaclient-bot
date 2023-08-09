import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import BaseCommand from "../../lib/additions/BaseCommand";
import BetterClient from "../../lib/extensions/BetterClient";
import BetterCommandInteraction from "../../lib/extensions/BetterInteraction";
import ms from "ms"
import Giveaway from "../../lib/additions/Giveaway";
export default class GStart extends BaseCommand {
    constructor(client: BetterClient) {

const choices: string[][]= [];
for(let i = 1; i <= 13; i++)  {
if(i <= 12) choices.push([`${i}h`, `${i}h`]);
choices.push([`${i}d`, `${i}d`])
};
        //@ts-ignore
        super("gstart", new SlashCommandBuilder().setName("gstart").setDescription("Creates a giveaway").addStringOption((option => option.setName("prize").setRequired(true).setDescription("the prize of the giveaway"))).addStringOption((option) => option.setRequired(true).setChoices(choices).setName("duration").setDescription("The duration of the giveaway")).addNumberOption((option) => option.setName("winners").setMaxValue(20).setMinValue(1).setDescription("The amoumnt of winners this giv eaway is going to have").setRequired(true)).addRoleOption((option) => option.setName("role").setRequired(false).setDescription("The role that's needed to enter")), client);
        this.client = client;
    }

    public override async execute(interaction: BetterCommandInteraction) {
        await interaction.deferReply()
        if(!interaction.memberPermissions?.has("MANAGE_GUILD")) return await interaction.editReply({content: "You are missing permissions"});
        if(!interaction.channel || !interaction.guild) return interaction.editReply({content: ""})
        const time = interaction.options.getString("duration");
        if(!time) return;
        const winners = interaction.options.getNumber("winners");
        if(!winners) return;
        const prize = interaction.options.getString("prize");
        if(!prize) return;
        const role = interaction.options.getRole("role")
        const msTime = ms(time);

        const embed = new MessageEmbed()
        .setTitle("New Giveaway!")
        .setDescription(`Prize: \`${prize}\`\nHosted by: ${interaction.user}\nWinners: ${winners}\nEnding: <t:${Math.round(Date.now() / 1000+ (msTime / 1000))}:R>${role ? `\nRole: ${role}`: ""}`)
        .setColor("GREEN");

        const components = new MessageActionRow().addComponents(new MessageButton().setEmoji("🎉").setCustomId("giveaway").setStyle("SUCCESS").setLabel("Enter"));
        const reply = await interaction.editReply({embeds:[embed], components: [components]});
        interaction.guild.giveaways.set(reply.id, new Giveaway(this.client, interaction.guild.id, interaction.channel.id, prize, reply.id, msTime, Date.now(), winners, role ? role.id : undefined));
    }
}