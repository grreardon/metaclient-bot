import BetterClient from "../../lib/extensions/BetterClient";
import BetterGuild from "../../lib/extensions/BetterGuild";
import { user } from "../../lib/types";

export default class WhitelistClass {

    public client: BetterClient
    public interval: number
    public name: string
    constructor(client: BetterClient) {
        this.client = client;
        this.interval = 3.6e+6;
        this.name = "whitelist"
    }   

   public async execute() {
  //   console.log("executing")
     if(!this.client.qualified.size) return; //console.log("no size :(")
      let user;

      while(!user) {
      const randomWinner = Math.round(Math.random() * this.client.qualified.size)
      const array = Array.from(this.client.qualified.values());

      const winner = array[randomWinner];

    user = await this.client.users.fetch(winner).catch(() => {})
      }
    this.client.qualified.clear();
    this.client.messageSent.clear();

    let whitelistSchema = await this.client.dataManager.get("users", user.id, "users").catch((err) => {this.client.logger.logError(err, __filename)}) || {};
    if(!Object.keys(whitelistSchema)) whitelistSchema = {_id: user.id, whitelists: 0};
    await this.client.dataManager.set("users", {_id: user.id}, {...whitelistSchema, whitelists: (whitelistSchema as user).whitelists + 1}, "users").catch((err) => this.client.logger.logError(err, __filename))
    try {
       (await user.createDM()).send(`Congrats! You won a whitelist spot in metaclient. You now have ${(whitelistSchema as user).whitelists + 1 || 1} whitelist spots.`);
    } catch {

    }
    const guild = this.client.guilds.cache.get(process.env.GUILD || "");
    if(!guild) return;
    const member = guild.members.cache.get(user.id);
    if(!member) return;
    await member.roles.add((member.guild as BetterGuild).config.whitelistRole);
    }
}