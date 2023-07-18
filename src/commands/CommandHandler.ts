import { CacheType, Client, Events, Interaction, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js";
import path from "path";
import fs from "fs";
import { CommandMapping, DiscordCommandConstructor } from "../definitions/DiscordCommand";

export class CommandHandler {
    private rest: REST;
    private commands: CommandMapping;
    private client: Client;

    constructor(client: Client){
        this.client = client;
        this.rest = new REST();
        this.rest.setToken(process.env.DISCORD_TOKEN!);

        this.commands = {};
        // Need to wrap this in an async function so the context is preserved
        this.client.on(Events.InteractionCreate, async (interaction: Interaction<CacheType>) => {
            return this.handleCommand(interaction);
        });
    }

    // This function will handle delegating commands to the proper handler
    private async handleCommand(interaction: Interaction<CacheType>){
        // Make sure it's a proper command
        if(!interaction.isChatInputCommand()) return;

        // Make sure we registered the command
        const command = this.commands[interaction.commandName];
        if(command == null) return;

        // Run our command handler and catch any errors
        try{
            await command.handleCommand(interaction);
        }catch(err){
            console.error(err);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }

    // This function will load all the command handlers from the commands folder recursively
    public async loadCommands(commandPath: string = path.join(__dirname, "./")){
        // Create array storing all commands
        const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        // Load files from the command path
        const commandFiles = await fs.promises.readdir(commandPath, {
            withFileTypes: true
        });

        for(const file of commandFiles){
            // If the file is a directory, recursively load the commands from that directory
            if(file.isDirectory()){
                // Load all commands into our commands array
                await this.loadCommands(path.join(commandPath, file.name));
                continue;
            }
            // Skip files that don't contain .command
            if(!file.name.includes(".command")) continue;

            // Import the command and append it to our existing commands
            const commandClass = await import(path.join(commandPath, file.name)) as DiscordCommandConstructor;

            // Make sure file is exporting a class [ie: {default: Object.keys({}) == 0}]
            if(SmallUtils.isObjectEmpty(Object.values(commandClass)[0])) continue;
            
            // Converts {className: class} to just class and creates a new instance
            const command = new (Object.values(commandClass)[0])();
            this.commands[command.getCommandInfo().name] = command;
        }
    }

    public async registerCommands(){
        // Convert all command objects into the request JSON
        const commands = Object.values(this.commands).map(command => command.getCommandInfo().toJSON());
        // Grab guild IDs from the environment variable
        const guildIds = process.env.DISCORD_GUILD_IDS?.split(",") ?? [];

        console.log(`Registering ${commands.length} slash commands`);
        if(guildIds.length == 0){
            // If no guild IDs are defined, register the commands globally
            try{
                await this.rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!), { body: commands });
            }catch(err){
                console.log(`Failed to register commands globally`);
                console.log(err);
                process.exit(0);
            }
        }else{
            // Register commands for each guild
            for(let guildId of guildIds){
                try{
                    await this.rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, guildId), { body: commands });
                }catch(err){
                    console.log(`Failed to register commands for guild ${guildId}`);
                    console.log(err);
                    process.exit(0);
                }
            }
        }
    }
}