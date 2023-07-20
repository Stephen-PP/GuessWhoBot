import dotenv from "dotenv";
dotenv.config({
    debug: true
});

import { DiscordBot } from "./bin/DiscordBot";
import { ethers } from "ethers";

const bot = new DiscordBot();
bot.login();