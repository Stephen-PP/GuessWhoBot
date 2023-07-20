import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";
import { StorageModel } from "../../../models/StorageModel";
import { IGroup } from "../../../definitions/Group";
import { EmbedUtils } from "../../../utils/EmbedUtils";

export class CreateSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("create")
            .setDescription("Creates a group to play guess who with")
            .addStringOption(option => 
                option
                    .setName("name")
                    .setDescription("Name of group to create")
            );
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {
        // Parse group name
        const name = interaction.options.getString("name") as string;

        // Create an empty group
        const group: IGroup = {
            name: name,
            addresses: [],
            history: []
        }

        // Add to storage
        await StorageModel.upsertGroup(group);

        // Let user know we popped off
        await interaction.reply({
            embeds: [
                EmbedUtils.buildSuccessEmbed()
                    .setTitle("Group Created")
                    .setDescription("Successfully created group: " + name)
            ]
        })
    }
}