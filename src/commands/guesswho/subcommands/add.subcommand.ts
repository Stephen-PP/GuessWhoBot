import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";
import { StorageModel } from "../../../models/StorageModel";
import { EmbedUtils } from "../../../utils/EmbedUtils";

export class AddSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("add")
            .setDescription("Adds addresses to a group after they pass through the selected filter")
            .addStringOption(option => 
                option
                    .setName("name")
                    .setDescription("Name of group to add addresses to")
                    .setRequired(true)
            )
            .addStringOption(option => 
                option
                    .setName("token")
                    .setDescription("ERC-20 Token Contract to filter against")
                    .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName("time")
                    .setDescription("Time (in minutes) from first liquidity addition to consider in filter")
                    .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName("minimum")
                    .setDescription("Minimum amount of ETH to consider in filter")
                    .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName("maximum")
                    .setDescription("Maximum amount of ETH to consider in filter")
                    .setRequired(true)
            )
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {
        // Parse group name and step (if exists)
        const name = interaction.options.getString("name") as string;
        const token = interaction.options.getString("token") as string;
        const time = interaction.options.getInteger("time") as number;
        const minimumEth = interaction.options.getInteger("minimum") as number;
        const maximumEth = interaction.options.getInteger("maximum") as number;

        // Get group from name
        const group = await StorageModel.getGroup(name);

        // Handle cases where group does not exist
        if(group === false){
            await interaction.reply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("Failed to retrieve group")
                        .setDescription("Could not find a group called " + name)
                ]
            })
            return;
        }

        group.addresses.push("0xCE5035D51237B4D72f6910D4ecB625E4fD6460Ec");
        group.history.push({
            contract: "Test",
            action: "add",
            addressesBefore: [],
            addressesAfter: ["0xCE5035D51237B4D72f6910D4ecB625E4fD6460Ec"]
        });

        await StorageModel.upsertGroup(group);

        await interaction.reply({
            content: "Added sample"
        })
    }
}