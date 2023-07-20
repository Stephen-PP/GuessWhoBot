import { EmbedBuilder } from "discord.js";

export class EmbedUtils {

    private static readonly ERROR_COLOR = "#a51d2d";
    private static readonly INFO_COLOR = "#1c71d8";
    private static readonly SUCCESS_COLOR = "#26a269";

    static buildErrorEmbed(){
        return new EmbedBuilder()
            .setColor(this.ERROR_COLOR)
            .setTimestamp(new Date())
            .setFooter({
                text: "Guess Who by Stephen (origamihands)"
            })
            .setAuthor({
                name: "Guess Who"
            });
    }

    static buildInfoEmbed(){
        return new EmbedBuilder()
            .setColor(this.INFO_COLOR)
            .setTimestamp(new Date())
            .setFooter({
                text: "Guess Who by Stephen (origamihands)"
            })
            .setAuthor({
                name: "Guess Who"
            });
    }

    static buildSuccessEmbed(){
        return new EmbedBuilder()
            .setColor(this.SUCCESS_COLOR)
            .setTimestamp(new Date())
            .setFooter({
                text: "Guess Who by Stephen (origamihands)"
            })
            .setAuthor({
                name: "Guess Who"
            });
    }
}