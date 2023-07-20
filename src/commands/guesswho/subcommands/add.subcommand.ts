import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";

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
            )
            .addStringOption(option => 
                option
                    .setName("token")
                    .setDescription("ERC-20 Token Contract to filter against")
            )
            .addIntegerOption(option => 
                option
                    .setName("time")
                    .setDescription("Time (in minutes) from first liquidity addition to consider in filter")
            )
            .addIntegerOption(option => 
                option
                    .setName("minimum")
                    .setDescription("Minimum amount of ETH to consider in filter")
            )
            .addIntegerOption(option => 
                option
                    .setName("maximum")
                    .setDescription("Maximum amount of ETH to consider in filter")
            )
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {

    }
}