import dotenv from "dotenv";
dotenv.config({
    debug: true
});

import { DiscordBot } from "./bin/DiscordBot";
import { ethers } from "ethers";
import { ERC20Contract } from "./abis/ERC20";
import { ProviderUtils } from "./utils/ProviderUtils";
import { AppearanceService } from "./services/AppearanceService";

const contract = ERC20Contract.from("0x076a3e1500f3110d8f4445d396a3d7ca6d0ca269");

(async() => {
    console.log("starting");
    const transfers = await AppearanceService.getAllTransfers("0x076a3e1500f3110d8f4445d396a3d7ca6d0ca269", "0xfb66321D7C674995dFcC2cb67A30bC978dc862AD", 17680100, 17680101);

    console.log(transfers);
})();

const bot = new DiscordBot();
//bot.login();