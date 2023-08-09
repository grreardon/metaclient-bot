import BaseEvent from "../../lib/additions/BaseEvent";
import BetterClient from "../../lib/extensions/BetterClient";
import BetterGuild from "../../lib/extensions/BetterGuild";


export default class Ready extends BaseEvent {
    
    constructor(client: BetterClient) {
        super(client, "ready")
    }

    override async execute() {
        console.log(`Logged in as ${this.client?.user?.tag}`);
        await this.client.loadJobs();
       setTimeout(async () => {
           this.client.loadCommands()    
           const guild = await this.client.guilds.cache.get(process.env.GUILD || "")
           if(!guild) return;
          await (guild as BetterGuild).loadGiveaways();
        
        }, 1000);
    }
}