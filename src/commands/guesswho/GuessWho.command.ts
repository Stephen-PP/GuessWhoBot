import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { DiscordCommand, DiscordSubcommand, SubcommandMapping } from "../../definitions/DiscordCommand";
import { CreateSubcommand } from "./subcommands/create.subcommand";
import { AddSubcommand } from "./subcommands/add.subcommand";
import { DeleteSubcommand } from "./subcommands/delete.subcommand";

export class GuessWho implements DiscordCommand {
    private commandInfo: SlashCommandBuilder;
    private subcommands: SubcommandMapping;

    constructor(){
        this.commandInfo = new SlashCommandBuilder()
            .setName("guesswho")
            .setDescription("Base command for the GuessWho filtration bot");
        this.subcommands = {};

        this.registerSubcommands(new CreateSubcommand(), new AddSubcommand(), new DeleteSubcommand());
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: CommandInteraction){
        // Make sure command is a chat input command
        if(!interaction.isChatInputCommand()){
            return;
        }

        // Run the command handler on the subcommand
        this.subcommands[interaction.options.getSubcommand()]?.handleCommand(interaction);
    }

    private registerSubcommands(...subcommands: DiscordSubcommand[]){
        for(let subcommand of subcommands){
            this.subcommands[subcommand.getCommandInfo().name] = subcommand;
            this.commandInfo.addSubcommand(subcommand.getCommandInfo());
        }
    }
}