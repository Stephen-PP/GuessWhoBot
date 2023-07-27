import { ERC20Contract } from "../abis/ERC20";
import bigDecimal from "js-big-decimal";

export interface BalanceReport {
    block: number,
    tokenPerWeth: bigDecimal,
    wethPerToken: bigDecimal,
    totalMarketCapWeth: bigDecimal
}

export class LiquidityService {
    static async getPriceAtBlock(token: string, pair: string, block: number): Promise<BalanceReport> {
        const WETH = ERC20Contract.WETH();
        const tokenContract = ERC20Contract.from(token);
        
        // Get the int representation of the WETH balance of the pair
        const wethBalance: bigDecimal = new bigDecimal(await WETH.balanceOf(pair, {
            blockTag: block
        }));

        // Now convert it into decimal (with 18 decimal points of precision)
        const wethBalanceDecimal: bigDecimal = wethBalance.divide(new bigDecimal(10n ** await WETH.decimals()), 18);
        console.log(wethBalanceDecimal.getPrettyValue(3, ","), "weth");

        // Get the int representation of the token balance of the pair
        const tokenBalance: bigDecimal = new bigDecimal(await ERC20Contract.from(token).balanceOf(pair, {
            blockTag: block
        }));

        // Convert it to decimal (with 18 decimal points of precision)
        const tokenBalanceDecimal: bigDecimal = tokenBalance.divide(new bigDecimal(10n ** await tokenContract.decimals()), 18);
        console.log(tokenBalanceDecimal.getPrettyValue(3, ","), "weth");

        const circulatingTokens: bigDecimal = new bigDecimal(await ERC20Contract.from(token).totalSupply());

        // Do the calculations for tokens per WETH and WETH per token
        const tokenPerWeth = tokenBalanceDecimal.divide(wethBalanceDecimal, 18);
        console.log(tokenPerWeth.getPrettyValue(3, ","), "tokens per weth");
        const wethPerToken = wethBalanceDecimal.divide(tokenBalanceDecimal, 18);
        console.log(wethPerToken.getPrettyValue(3, ","), "weth per token");

        return {
            block,
            tokenPerWeth,
            wethPerToken,
            totalMarketCapWeth: wethBalanceDecimal.add(wethPerToken.multiply(circulatingTokens))
        }
    }
}