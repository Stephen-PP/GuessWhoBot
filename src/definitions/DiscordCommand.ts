import { CommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";

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