import { ethers } from "ethers";
import UniswapV2Factory from "../abis/UniswapV2Factory";
import axios from "axios";
import { ProviderUtils } from "../utils/ProviderUtils";

interface LiquidityResponse {
    block: number,
    pair: string
}

export class BlockService {

    static async getFirstLiquidityBlock(token: string): Promise<LiquidityResponse | false>{
        // First, we'll get the pair address
        const pair: string = await UniswapV2Factory.getPair(token, /* WETH */ "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

        // For now, only accept WETH pairs
        if(pair === "0x0000000000000000000000000000000000000000"){
            return false;
        }

        const pairResponse = await axios({
            url: `${process.env.TRUEBLOCKS_PROVIDER}/list?addrs=${pair}`,
            method: "GET"
        });

        const pairCreationBlock: number | undefined = pairResponse.data?.data[0]?.blockNumber;

        // Make sure response from Trueblocks is not malformed
        if(pairCreationBlock == null){
            return false;
        }

        // Now we need to find out when the pair received tokens
        const blockArray = [];

        // Get the current block number so that we make sure we don't surpass it in our check
        const currentBlock = await ProviderUtils.getProvider().getBlockNumber();

        // Now add blocks one by one to the array
        for(let i = 0; i < 10000; i++){
            if(i + pairCreationBlock > currentBlock){
                break;
            }

            blockArray.push(pairCreationBlock + i);
        }

        // Send request to get the data
        const liquidityResponse = await axios({
            url: `${process.env.TRUEBLOCKS_PROVIDER}/tokens?addrs=${token} ${pair}&blocks=${blockArray.join(" ")}&noZero=true`,
            method: "GET"
        })

        // Return the earliest block number (first in array)
        const liquidityBlock: number | undefined = liquidityResponse.data?.data[0]?.blockNumber;

        // If array is empty or response is malformed
        if(liquidityBlock == null){
            return false;
        }

        return {
            block: liquidityBlock,
            pair: pair
        };
    }
}