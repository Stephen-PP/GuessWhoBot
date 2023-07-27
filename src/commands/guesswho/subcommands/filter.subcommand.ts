import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";
import { StorageModel } from "../../../models/StorageModel";
import { EmbedUtils } from "../../../utils/EmbedUtils";
import { BlockService } from "../../../services/BlockService";
import { AppearanceService } from "../../../services/AppearanceService";
import { BalanceReport, LiquidityService } from "../../../services/LiquidityService";
import bigDecimal from "js-big-decimal";

export class FilterSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("filter")
            .setDescription("Filters and modifies addresses tin a group after they pass through the selected filter")
            .addStringOption(option => 
                option
                    .setName("name")
                    .setDescription("Name of group to filter addresses to")
                    .setRequired(true)
            )
            .addStringOption(option => 
                option
                    .setName("token")
                    .setDescription("ERC-20 Token Contract to filter against")
                    .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName("time")
                    .setDescription("Time (in minutes) from first liquidity addition to consider in filter")
                    .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName("minimum")
                    .setDescription("Minimum amount of ETH to consider in filter")
                    .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName("maximum")
                    .setDescription("Maximum amount of ETH to consider in filter")
                    .setRequired(true)
            )
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {
        // Parse group name and step (if exists)
        const name = interaction.options.getString("name") as string;
        const token = interaction.options.getString("token") as string;
        const time = interaction.options.getInteger("time") as number;
        const minimumEth = interaction.options.getInteger("minimum") as number;
        const maximumEth = interaction.options.getInteger("maximum") as number;

        // Get group from name
        const group = await StorageModel.getGroup(name);

        // Handle cases where group does not exist
        if(group === false){
            await interaction.reply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("Failed to retrieve group")
                        .setDescription("Could not find a group called " + name)
                ]
            })
            return;
        }

        // Now, let the user know we're finding the first block and
        await interaction.reply({
            embeds: [
                EmbedUtils.buildInfoEmbed()
                    .setTitle("Gathering Information (1/3)")
                    .setDescription("Currently retrieving information about when liquidity was added to the token. This may take up to 5 minutes.")
            ]
        });

        const startingBlock = await BlockService.getFirstLiquidityBlock(token);

        // Make sure we found a WETH pair for the provided token
        if(startingBlock === false){
            await interaction.editReply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("Failed to Gather Info")
                        .setDescription("Failed to gather information regarding the token. This happens for these possible reasons:" +
                            "\n1) The token contract is invalid" +
                            "\n2) The pair is not a WETH pair" +
                            "\n3) The Uniswap pair was created more than a day before liquidity was added" +
                            "\n\nVerify the reason the bot failed is not one of these. If so, contact Stephen."
                        )
                ]
            })
            return;
        }

        // Calculate the range of blocks to grab transfers for
        const blocksToSearch = Math.ceil((time*60)/12);

        // Let the user know we are finding transfers
        await interaction.editReply({
            embeds: [
                EmbedUtils.buildInfoEmbed()
                    .setTitle("Gathering Information (2/3)")
                    .setDescription("Currently retrieving all token transfers in the requested time range. This may take up to 15 minutes, depending on the provided range.")
            ]
        });

        // Now, we need to get all sales in the period
        const transfers = await AppearanceService.getAllTransfers(startingBlock.pair, token, startingBlock.block, startingBlock.block + blocksToSearch);
        console.log("transfered hanled");

        // Let the user know we are finding transfers
        await interaction.editReply({
            embeds: [
                EmbedUtils.buildInfoEmbed()
                    .setTitle("Gathering Information (3/3)")
                    .setDescription("Currently retrieving historical market cap in the requested time range. This may take up to 5 minutes, depending on the provided range.")
            ]
        });

        // Before we loop through the transfers, create a cache for block price lookups and an array to store addresses that meet the filter
        const addresses: string[] = [];
        const blockCache: {
            [block: number]: BalanceReport
        } = {};

        for(let transfer of transfers) {
            // Skip sales (for now)
            if(transfer.action === "sell") continue;
            console.log(transfer);

            // First, check if our price information is in the cache, if not load it
            let liquidityInfo: BalanceReport;
            if(blockCache[transfer.blockNumber] == null){
                liquidityInfo = await LiquidityService.getPriceAtBlock(token, startingBlock.pair, transfer.blockNumber);
                blockCache[transfer.blockNumber] = liquidityInfo;
            }else{
                liquidityInfo = blockCache[transfer.blockNumber];
            }

            // Now determine the WETH value of the token transfer
            const wethValue = liquidityInfo.wethPerToken.multiply(new bigDecimal(transfer.tokenAmount));
            console.log("weth value", wethValue.getPrettyValue(3, ","));

            // Use bigDecimal to compare the values
            const comparedLowerBound = wethValue.compareTo(new bigDecimal(minimumEth));
            console.log(comparedLowerBound, "lower bound");
            const comparedUpperBound = wethValue.compareTo(new bigDecimal(maximumEth));
            console.log(comparedUpperBound, "upper bound");

            // Verify the values are within the bounds set by the user
            if(comparedLowerBound >= 0 /*equal to or greater than*/){
                if(comparedUpperBound <= 0 /*equal to or less than*/){
                    // Add the address to the array of addresses to meet the criteria
                    addresses.push(transfer.address);
                }
            }
        }

        // First, make sure we actually found some addresses to add
        if(addresses.length === 0){
            // Let em know the filter too strict
            await interaction.editReply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("No Addresses Found")
                        .setDescription("No addresses were found to match the provided filter, so the operation has been aborted.")
                ]
            })
            return;
        }

        // Next, deep clone current addresses
        let addressesBefore: string[] = JSON.parse(JSON.stringify(group.addresses));
        
        // If group addresses is zero, we're adding all valid addresses to this
        if(addressesBefore.length === 0){
            group.addresses = addresses;
        }else{
            // Now, we need to create the union of the two arrays
            const addressUnion: string[] = [];
            // Lowercase the addresses we will compare to
            const lowercasedAddresses = addresses.map(address => address.toLowerCase());
            for(let address of group.addresses){
                // If new addresses array contains an array currently in the group, that address gets to live
                if(lowercasedAddresses.includes(address.toLowerCase())){
                    addressUnion.push(address);
                }
            }

            // Now set group.addresses to be equal to our new union
            group.addresses = addressUnion;
        }

        // Push the history
        group.history.push({
            contract: token,
            action: "add",
            addressesBefore: addressesBefore,
            addressesAfter: group.addresses
        });

        // Save the results
        await StorageModel.upsertGroup(group);

        // Let the user know we popped off
        await interaction.editReply({
            embeds: [
                EmbedUtils.buildSuccessEmbed()
                    .setTitle("Filtered Group Addresses Successfully")
                    .setDescription("Successfully processed the provided filter and modified the group accordingly. Use /guesswho info for more information")
                    .addFields({
                        name: "Previous Address Count",
                        value: `${addressesBefore.length}`,
                        inline: true
                    }, {
                        name: "New Address Count",
                        value: `${group.addresses.length}`,
                        inline: true
                    })
            ]
        })
    }
}