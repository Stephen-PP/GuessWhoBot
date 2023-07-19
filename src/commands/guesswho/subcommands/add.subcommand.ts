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
                    .setDescription("Name of group to operate or create")
            )
            .addStringOption(option => 
                option
                    .setName("address")
                    .setDescription("Name of group to operate or create")
            )
            
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {

    }
}