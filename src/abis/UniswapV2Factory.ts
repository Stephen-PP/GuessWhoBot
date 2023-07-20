import { ethers } from "ethers";
import { ProviderUtils } from "../utils/ProviderUtils";

const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const factoryAbi = ["function getPair(address, address) external view returns (address)"];
const UniswapV2Factory = new ethers.Contract(factoryAddress, factoryAbi, ProviderUtils.getProvider());

export default UniswapV2Factory;