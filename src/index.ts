import dotenv from "dotenv";
import { DiscordBot } from "./bin/DiscordBot";
import { ethers } from "ethers";
dotenv.config();

const bot = new DiscordBot();
bot.login();