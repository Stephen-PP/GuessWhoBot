import { Client, GatewayIntentBits} from "discord.js";
import { CommandHandler } from "../commands/CommandHandler";
import { ProviderUtils } from "../utils/ProviderUtils";
import UniswapV2Factory from "../abis/UniswapV2Factory";
import { BlockService } from "../services/BlockService";

export class DiscordBot{
    private client: Client;

    constructor(){
        // Do necessary checks on process env
        if(process.env.DISCORD_TOKEN == null || process.env.DISCORD_CLIENT_ID == null){
            console.log("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID environment variable");
            process.exit(0);
        }

        // Create the client
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
        });
    }

    // Logins into the Discord bot
    public async login(){
        const commandHandler = new CommandHandler(this.client);
        await commandHandler.loadCommands();
        await commandHandler.registerCommands();
        // Login
        await this.client.login(process.env.DISCORD_TOKEN);
        console.log("Logged in as " + this.client.user?.tag);

        // Test shit
        console.log(await BlockService.getFirstLiquidityBlock("0xfb66321D7C674995dFcC2cb67A30bC978dc862AD"));
    }

   
}