import { ethers } from "ethers";

export class ProviderUtils {
    private static provider: ethers.JsonRpcProvider;

    constructor(){
        if(process.env.HTTP_PROVIDER == null || process.env.TRUEBLOCKS_PROVIDER == null){
            console.log("Missing HTTP_PROVIDER or TRUEBLOCKS_PROVIDER environment variable");
            process.exit(0);
        }
        ProviderUtils.provider = new ethers.JsonRpcProvider(process.env.HTTP_PROVIDER);
    }

    public static getProvider(): ethers.JsonRpcProvider {
        return this.provider;
    }
}

// Initiate the constructor
new ProviderUtils();