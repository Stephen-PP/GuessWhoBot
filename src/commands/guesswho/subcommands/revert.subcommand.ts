import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";
import { IGroup, IGroupHistory } from "../../../definitions/Group";
import { StorageModel } from "../../../models/StorageModel";
import { EmbedUtils } from "../../../utils/EmbedUtils";

export class RevertSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("revert")
            .setDescription("Reverts a group to right before specified point in its history")
            .addStringOption(option => 
                option
                    .setName("name")
                    .setDescription("Name of group to revert")
                    .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName("step")
                    .setDescription("Point in group history to revert to. Check info for more information")
                    .setRequired(true)
            )
            
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {
        // Parse group name and step to revert to
        const name = interaction.options.getString("name") as string;
        const step = interaction.options.getInteger("step") as number;

        // Make sure point exists in group history and that group exists
        const group = await StorageModel.getGroup(name);
        if(group === false){
            await interaction.reply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("Failed to retrieve group")
                        .setDescription("The requested group does not exist. Please ensure proper spelling")
                ]
            })
            return;
        }

        if(group.history.length <= step){
            await interaction.reply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("Failed to retrieve group")
                        .setDescription("Could not get step #" + step + " from the requested group")
                ]
            })
            return;
        }

        // Create the new history object
        const newHistory: IGroupHistory[] = group.history.slice(0, step);
        newHistory.push({
            contract: step.toFixed(0),
            action: "revert",
            addressesBefore: group.addresses,
            addressesAfter: group.history[step].addressesBefore
        })


        // Create an empty group
        const revertedGroup: IGroup = {
            name: name,
            addresses: group.history[step].addressesBefore,
            history: newHistory
        }

        // Add to storage
        await StorageModel.upsertGroup(revertedGroup);

        // Let user know we popped off
        await interaction.reply({
            embeds: [
                EmbedUtils.buildSuccessEmbed()
                    .setTitle("Group Reverted")
                    .setDescription(`Successfully reverted group ${name} back to step #${step}`)
            ]
        })
    }
}