import { ChatInputCommandInteraction, CommandInteraction, Interaction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

// Surface layer commands
export interface DiscordCommand {
    getCommandInfo: () => SlashCommandBuilder;
    handleCommand: (interaction: CommandInteraction) => Promise<unknown>;
}

export interface DiscordCommandConstructor {
    new (): DiscordCommand;
}

export type CommandMapping = {
    [key: string]: DiscordCommand;
}

// Subcommands
export interface DiscordSubcommand {
    getCommandInfo: () => SlashCommandSubcommandBuilder;
    handleCommand: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
}
export type SubcommandMapping = {
    [key: string]: DiscordSubcommand;
}