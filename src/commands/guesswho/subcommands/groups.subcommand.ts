import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";

export class GroupsSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("groups")
            .setDescription("Perform operations on groups")
            .
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {

    }
}