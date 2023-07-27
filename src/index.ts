import dotenv from "dotenv";
dotenv.config({
    debug: true
});

import { DiscordBot } from "./bin/DiscordBot";
import { ProviderUtils } from "./utils/ProviderUtils";

/*const contract = ERC20Contract.from("0x076a3e1500f3110d8f4445d396a3d7ca6d0ca269");

(async() => {
    console.log("starting");
    const liq = await LiquidityService.getPriceAtBlock("0xfb7b4564402e5500db5bb6d63ae671302777c75a", "0xa29fe6ef9592b5d408cca961d0fb9b1faf497d6d", 17787061);
    //const transfers = await AppearanceService.getAllTransfers("0x076a3e1500f3110d8f4445d396a3d7ca6d0ca269", "0xfb66321D7C674995dFcC2cb67A30bC978dc862AD", 17680100, 17680101);

    console.log(liq);
})();*/

const bot = new DiscordBot();
bot.login();