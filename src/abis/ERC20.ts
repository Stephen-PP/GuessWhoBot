import { ethers } from "ethers";
import { ProviderUtils } from "../utils/ProviderUtils";

export class ERC20Contract {
    private static abi: string[];
    private static WETHContract: ethers.Contract;

    constructor(){
        ERC20Contract.abi = [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function name() view returns (string)",
            "function symbol() view returns (string)"
        ];

        ERC20Contract.WETHContract = new ethers.Contract("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", ERC20Contract.abi, ProviderUtils.getProvider());
    }

    static WETH(){
        return this.WETHContract;
    }

    static from(address: string): ethers.Contract {
        return new ethers.Contract(address, this.abi, ProviderUtils.getProvider());
    }
}

new ERC20Contract();