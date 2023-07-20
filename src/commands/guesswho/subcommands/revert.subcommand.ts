import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";

export class AddSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("revert")
            .setDescription("Reverts a group to a previous point in its history")
            .addStringOption(option => 
                option
                    .setName("name")
                    .setDescription("Name of group to revert")
            )
            .addIntegerOption(option => 
                option
                    .setName("point")
                    .setDescription("Point in group history to revert to. Check info for more information")
            )
            
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {

    }
}