import { ethers } from "ethers";
import UniswapV2Factory from "../abis/UniswapV2Factory";
import axios from "axios";
import { ProviderUtils } from "../utils/ProviderUtils";
import { ERC20Contract } from "../abis/ERC20";
import bigDecimal from "js-big-decimal";

interface CompiledTransfer {
    action: "sell" | "buy",
    tokenAmount: bigDecimal,
    address: string,
    hash: string,
    blockNumber: number
}

interface UnknownTransaction {
    blockNumber: number,
    transactionIndex: number
}

interface ProcessedLog {
    processed: ethers.LogDescription,
    raw: ethers.Log
}

interface ProcessedTransaction extends ethers.TransactionReceipt {
    processedLogs: (ProcessedLog | null)[]
}

export class AppearanceService {

    static async getAllTransfers(pairAddress: string, tokenAddress: string, startingBlock: number, endingBlock: number): Promise<CompiledTransfer[]>{
        // Create an instance of our contract
        const contract = ERC20Contract.from(tokenAddress);

        const decimalScientific: bigDecimal = new bigDecimal(10n ** await contract.decimals());

        // First, prepare to get all transactions in the time period
        const transferTransactions = await axios({
            url: `${process.env.TRUEBLOCKS_PROVIDER}/export?addrs=${pairAddress}&firstBlock=${startingBlock}&lastBlock=${endingBlock}&receipts=true`,
            method: "GET"
        })

        // Make sure the data exists in the response from TrueBlocks
        const transactions: UnknownTransaction[] = transferTransactions.data?.data;
        if(transactions == null){
            return [];
        }

        // Find all our transactions
        const foundTransactions: ethers.TransactionReceipt[] = await this.findTransactions(transactions);

        // Extract log information from found transactions
        const processedTransactions = this.processLogs(foundTransactions, contract.interface);

        // Array to store all processed transfers
        const transfers: CompiledTransfer[] = [];

        for(let txn of processedTransactions){
            // Skip contract creation contracts
            if(txn.to == null) continue;

            const logs = txn.processedLogs;

            // Process logs to attempt to compile the transaction action
            for(let log of logs){
                // Skip unparsed logs
                if(log == null) continue;

                // Skip logs not from the token
                if(log.raw.address.toLowerCase() !== tokenAddress.toLowerCase()) continue;

                // Skip logs that aren't Transfer logs
                if(log.processed.name !== "Transfer") continue;

                const from: string = log.processed.args[0];
                const to: string = log.processed.args[1];
                const amount: bigDecimal = new bigDecimal(log.processed.args[2]).divide(decimalScientific, 18);

                // Buy transactions (token transfer from LP to buyer [and eth from buyer to LP])
                if(from.toLowerCase() === pairAddress.toLowerCase() && to.toLowerCase() === txn.to.toLowerCase()){
                    // Add our transfer to the transfers array
                    transfers.push({
                        action: "buy",
                        tokenAmount: amount,
                        address: txn.to,
                        hash: txn.hash,
                        blockNumber: txn.blockNumber
                    })
                }
                // Sell transactions (to the LP from the buyer [and eth from LP to buyer])
                else if(to.toLowerCase() === pairAddress.toLowerCase() && from.toLowerCase() === txn.to.toLowerCase()){
                    // Add our transfer to the transfers array
                    transfers.push({
                        action: "sell",
                        tokenAmount: amount,
                        address: txn.to,
                        hash: txn.hash,
                        blockNumber: txn.blockNumber
                    })
                }
            }
        }

        return transfers;
    }

    private static async findTransactions(transactions: UnknownTransaction[]): Promise<ethers.TransactionReceipt[]>{
        // Get the instance of our ethers provider
        const provider = ProviderUtils.getProvider();

        // Array to store found transactions
        const foundTransactions: ethers.TransactionReceipt[] = [];

        // Go through the unknown transactions
        for(let txn of transactions){
            // Get the block of the unknown transaction and skip if it block isn't found
            const block = await provider.getBlock(txn.blockNumber);
            if(block == null) continue;

            // Get transaction by txn index in block and skip it if it isn't found
            const foundTxn = await block.getTransaction(txn.transactionIndex);
            if(foundTxn == null) continue;

            // Get the receipt of the found txn and skip it if it isn't found
            const receipt = await provider.getTransactionReceipt(foundTxn.hash);
            if(receipt == null) continue;

            // Add the found txn to the end array
            foundTransactions.push(receipt);
        }

        return foundTransactions;
    }

    private static processLogs(transactions: ethers.TransactionReceipt[], contractInterface: ethers.Interface): ProcessedTransaction[]{
        const processedTxns: ProcessedTransaction[] = [];

        for(let txn of transactions){
            // Process the transaction logs
            const parsedLogs: (ProcessedLog | null)[] = txn.logs.map((log) => {
                // Parse the log
                const processed = contractInterface.parseLog(log.toJSON());
                // If it couldn't be parsed, return null
                if(processed == null) return null;
                // Return our modified ProcessedLog object
                return {
                    processed: processed,
                    raw: log
                }
            });

            // Cast txn to ProcessedTransaction and set the new property
            (txn as ProcessedTransaction).processedLogs = parsedLogs;

            // Cast txn to ProcessedTransaction again [now that it meets the requirements to do so] and push to finalized array
            processedTxns.push(txn as ProcessedTransaction);
        }

        return processedTxns;
    }
}