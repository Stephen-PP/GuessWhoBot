import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";
import { StorageModel } from "../../../models/StorageModel";
import { EmbedUtils } from "../../../utils/EmbedUtils";

export class DeleteSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("delete")
            .setDescription("Deletes a group")
            .addStringOption(option => 
                option
                    .setName("name")
                    .setDescription("Name of group to delete")
            );
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {
        const groupName = interaction.options.getString("name") as string;

        const deleted = await StorageModel.deleteGroup(groupName);

        if(deleted){
            interaction.reply({
                embeds: [
                    EmbedUtils.buildSuccessEmbed()
                        .setTitle("Group Deleted")
                        .setDescription("Successfully deleted group: " + groupName)
                ]
            })
        }else{
            interaction.reply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("Group Deletion Failed")
                        .setDescription(`Could not delete group: ${groupName}. Are you sure it exists?`)
                ]
            })
        }
    }
}