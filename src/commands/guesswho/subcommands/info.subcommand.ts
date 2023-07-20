import { APIEmbedField, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { DiscordSubcommand } from "../../../definitions/DiscordCommand";
import { EmbedUtils } from "../../../utils/EmbedUtils";
import { StorageModel } from "../../../models/StorageModel";
import { SmallUtils } from "../../../utils/SmallUtils";

export class InfoSubcommand implements DiscordSubcommand{
    private commandInfo: SlashCommandSubcommandBuilder;

    constructor(){
        this.commandInfo = new SlashCommandSubcommandBuilder()
            .setName("info")
            .setDescription("Gets information about a specific group")
            .addStringOption(option => 
                option
                    .setName("name")
                    .setDescription("Name of group to grab information of")
            )
            .addIntegerOption(option => 
                option
                    .setName("history_step")
                    .setDescription("Gets the group information at specified history index")
                    .setRequired(false)
            )
            
    }

    public getCommandInfo(){
        return this.commandInfo;
    }

    public async handleCommand(interaction: ChatInputCommandInteraction) {
        // Parse group name and step (if exists)
        const name = interaction.options.getString("name") as string;
        const step = interaction.options.getInteger("history_step");

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

        // Make sure we have a history to show
        if(group.history.length === 0){
            await interaction.reply({
                embeds: [
                    EmbedUtils.buildErrorEmbed()
                        .setTitle("No History Found")
                        .setDescription("No history was found for the provided group. Make sure you've done something with it before")
                ]
            })
            return;
        }

        const embed = EmbedUtils.buildSuccessEmbed();
        embed.setTitle(`${name} Information`);

        // Handle the different embeds for it step is enabled or disabled
        if(step != null){
            // Make sure the step actually exists in the history
            if(group.history.length >= step){
                await interaction.reply({
                    embeds: [
                        EmbedUtils.buildErrorEmbed()
                            .setTitle("Failed to retrieve group")
                            .setDescription("Could not get step #" + step + " from the requested group")
                    ]
                })
                return;
            }

            // Build the steps embed
            embed.setDescription("The following addresses were modified at the requested step.");

            const history = group.history[step];

            // Create the first field dependent on if the action was add or revert
            const firstField: APIEmbedField = history.action === "revert" ? 
            {
                name: "Group Reversion",
                value: "Group was reverted at this step to old step #" + history.contract,
                inline: false
            } :
            {
                name: "Contract Address",
                value: history.contract,
                inline: false
            }

            // Add the remaining fields to the embed
            embed.addFields(firstField, {
                name: "Addresses Before",
                value: history.addressesBefore.join("\n"),
                inline: true
            }, {
                name: "Addresses After",
                value: history.addressesAfter.join("\n"),
                inline: true
            })
        }else{
            // Build the embed description
            let description = `Retrieved the following information about group ${name}:
            
            Format:
            [History Step]) [ERC-20 Address]: [Addresses Before] -> [Addresses After]
            `;

            // Add the extra information to the description
            for(let i = 0; i < group.history.length; i++){
                const history = group.history[i];

                description += `**${i}**) ${SmallUtils.truncateAddress(history.contract)}: **${history.addressesBefore.length}** -> **${history.addressesAfter.length}**\n`
            }

            embed.setDescription(description);

            // Now build the field
            embed.addFields({
                name: "Current Addresses",
                value: group.addresses.join("\n")
            })
        }

        // Send the embed
        await interaction.reply({
            embeds: [embed]
        });
    }
}