import { CategoryChannel, GuildMember, Interaction } from "discord.js";
import BaseEvent from "../../lib/additions/BaseEvent";
import BetterClient from "../../lib/extensions/BetterClient";
import BetterGuild from "../../lib/extensions/BetterGuild";


export default class InteractionCreate extends BaseEvent {
    constructor(client: BetterClient) {
        super(client, "interactionCreate")
    }

    override async execute(interaction: Interaction) {
        if(interaction.isCommand()) {
            const command = this.client.commands.get(interaction.commandName);
            if(command) {
                if(!interaction.guild || !interaction.guild.id) return await interaction.reply("")
                return await command.execute(interaction)
            }
        } else if(interaction.isSelectMenu()) {
            if(!interaction.guild || !interaction.guild.id) return await interaction.reply("")
            if(interaction.customId === "tickets") {
               await interaction.deferReply({ephemeral: true})
                let category;
               switch(interaction.values[0]) {
                case "Factions": {
                    category = interaction.guild?.channels.cache.get((interaction.guild as BetterGuild).config.factionsCat) || await interaction.guild?.channels.fetch((interaction.guild as BetterGuild).config.factionsCat).catch(() => {})
                    break;
                }
                case "Nft": {
                    category = interaction.guild?.channels.cache.get((interaction.guild as BetterGuild).config.nftCat) || await interaction.guild?.channels.fetch((interaction.guild as BetterGuild).config.nftCat).catch(() => {})
                    break;
                }
               }
                if(!category || category.type !== "GUILD_CATEGORY") return await interaction.editReply({content: "Invalid config for the server, contact an admin"});
                //console.log(interaction.user.username.length > 90 ?interaction.user.username.slice(0,91) : interaction.user.username)
                if((category as CategoryChannel).children.filter(ch => ch.permissionOverwrites.cache.has(interaction.user.id)).size > 3) {
                    return await interaction.editReply({content: "You already have too many tickets in this category open."})
                }

                const number = await this.client.dataManager.get("ticketNum", interaction.guild.id, "ticketNum").catch(() => {});
                //@ts-ignore
                if(!number || !number.num) await this.client.dataManager.set("ticketNum", {_id: interaction.guild.id}, {num: 1}, "ticketNum")
                //@ts-ignore
                else await this.client.dataManager.set("ticketNum", {_id: interaction.guild.id}, {num: (number?.num || 0) + 1}, "ticketNum")
                //@ts-ignore
                const channel = await (category as CategoryChannel).createChannel(`${interaction.values[0]}-${((number.num || 0) + 1).toString().padStart(4, "0")}}`, {permissionOverwrites: [{
                    deny: "VIEW_CHANNEL",
                    id: interaction.guild.id
                }, {
                    allow: "VIEW_CHANNEL",
                    id: interaction.user.id
                }, {
                    allow: "VIEW_CHANNEL",
                    id: (interaction.guild as BetterGuild).config.supportRole
                }]});

                    channel.send({embeds:[{
                        title: `${interaction.values[0]} Ticket`,
                        color: "GREEN",
                        description: "Thank you for making a ticket! A member of our support team will be with you shortly."
                    }]})
                await interaction.editReply(`Sucessfully created ticket ${channel}`)
            }
        } else if(interaction.isButton()) {
            await interaction.deferReply({ephemeral: true})
            if(interaction.customId === "giveaway") {
                const giveaway = (interaction.guild as BetterGuild).giveaways.get(interaction.message?.id || "");
                if(!giveaway) return;
                if(giveaway.role) {
                    if(interaction.member && interaction.member instanceof GuildMember && interaction.member.roles.cache.has(giveaway.role)) {
                        if(giveaway.entries.has(interaction.user.id)) {
                            giveaway.entries.delete(interaction.user.id);
                            return await interaction.editReply("You have removed your entry for this giveaway");
                        } else {
                            giveaway.addEntry(interaction.user.id)
                            return await interaction.editReply("You have entered for this giveaway")
                        }
                    } else {
                        return await interaction.editReply("You don't have the roles necessary to enter this giveaway.")
                    }
                } else {
                    if(giveaway.entries.has(interaction.user.id)) {
                        giveaway.entries.delete(interaction.user.id);
                        return await interaction.editReply("You have removed your entry for this giveaway");
                    } else {
                        giveaway.addEntry(interaction.user.id)
                        return await interaction.editReply("You have entered for this giveaway")
                    }
                }
            }
        }
    }
}