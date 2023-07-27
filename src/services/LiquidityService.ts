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
        const wethBalance: bigDecimal = new bigDecimal(await ERC20Contract.WETH().balanceOf(pair, {
            blockTag: block
        }));

        const tokenBalance: bigDecimal = new bigDecimal(await ERC20Contract.from(token).balanceOf(pair, {
            blockTag: block
        }));

        const circulatingTokens: bigDecimal = new bigDecimal(await ERC20Contract.from(token).totalSupply());

        console.log(wethBalance, "weth balance");
        console.log(tokenBalance, "token balance");

        // Do the calculations for tokens per WETH and WETH per token
        const tokenPerWeth = tokenBalance.divide(wethBalance, 18);
        const wethPerToken = wethBalance.divide(tokenBalance, 18);

        return {
            block,
            tokenPerWeth,
            wethPerToken,
            totalMarketCapWeth: wethBalance.add(wethPerToken.multiply(circulatingTokens))
        }
    }
}