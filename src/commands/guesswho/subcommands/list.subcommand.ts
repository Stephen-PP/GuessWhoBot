import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";
import { StorageModel } from "../../../models/StorageModel";
import { EmbedUtils } from "../../../utils/EmbedUtils";

export class ListSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("list")
            .setDescription("Lists all available groups")
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {
        const groups = await StorageModel.getGroups();

        // If no groups exist, show that
        if(groups.length === 0){
            await interaction.reply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("No Groups Found")
                        .setDescription("No groups found! Create a group for it to be listed here")
                ]
            })
            return;
        }

        // Build the description
        let description = "Groups:\n";

        for(let group of groups){
            description += `[${group.name}]: ${group.addresses.length} Addresses - ${group.history.length} Steps`
        }

        // Send the list of groups
        await interaction.reply({
            embeds: [
                EmbedUtils.buildSuccessEmbed()
                    .setTitle("Current Groups")
                    .setDescription(description)
            ]
        });
    }
}