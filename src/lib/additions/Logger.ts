import chalk from 'chalk';
import { MessageAttachment } from 'discord.js';
import BetterClient from '../extensions/BetterClient';


export default class Logger {
    public client: BetterClient
   private errorHookID = process.env.ERRORHOOKID;
   private errorHookToken = process.env.ERRORHOOKTOKEN;
   private ticketLogs = require("../../../config.json").ticketLogs;
    constructor(c: BetterClient) {
        this.client = c;
    }

    public async logError(error: any, folder: string) {
        if(typeof error == "object") error = JSON.stringify(error);
        this.logToConsole("ERROR", `${folder}\n\n${error}`);
        if(typeof error !== "string") return;
       if(this.errorHookID && this.errorHookToken) await (await this.client.fetchWebhook(this.errorHookID, this.errorHookToken))?.send({content: `new error in \`${folder}\``, files: [new MessageAttachment(Buffer.from(error), "error.txt")]})
    }

    public async logTicket(buf: Buffer, name: string, closer: string ) {
       const channel = (await this.client.channels.fetch(this.ticketLogs).catch(() => {})) || false
       if(!channel) return;
       if(channel.isText()) {
           await channel.send({content: `${name}\nclosed by: ${closer}`, files: [ new MessageAttachment(buf, `${name}.txt`)]})
       }
    }
    private logToConsole(type: string, message: any) {
        console.log(`\n${chalk.red.bold(`===== ${type} =====`)}\n\n${message}\n\n${chalk.red.bold("=".repeat(12 + type.length))}\n`)
    }
}
