import { Client, ClientOptions, Snowflake } from "discord.js";
import DataManager from "../additions/DataManager";
import Logger from "../additions/Logger";
import { readdirSync} from "fs"
import BaseCommand from "../additions/BaseCommand";
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { REST } from "@discordjs/rest"
import BaseEvent from "../additions/BaseEvent";

export default class BetterClient extends Client {

    dataManager: DataManager;
    logger: Logger
    commands: Map<string, BaseCommand>
    commandData: RESTPostAPIApplicationCommandsJSONBody[];
    public restData: REST | null;
    public messageSent: Map<Snowflake, number>
    public qualified: Set<Snowflake>
    public jobs: Map<string, unknown>
    constructor(options: ClientOptions) {
        super(options);
        //@ts-ignore
        this.dataManager = new DataManager({uri: process.env.DB, mongoData: {}, redisData: {}}, this);
        this.logger = new Logger(this);
        this.commands = new Map<string, BaseCommand>();
        this.commandData = [];
        this.restData = null;
        this.messageSent = new Map<Snowflake, number>();
        this.qualified = new Set<Snowflake>();
        this.jobs = new Map<string, unknown>();
    }

    override login(token: string | undefined) {
        this.dataManager.login().then(() => console.log("Logged into DB")).catch(err => console.log(err)); 
        this.dataManager.cacheManager.cache.flushall();;
        this.loadEvents();
        return super.login(token);
    }

    public async loadJobs() {
        readdirSync(`${__dirname}/../../bot/cronjobs`).forEach(async (file) => {
            if(file.endsWith("js")) {
                const commandFile = await import(`../../bot/cronjobs/${file}`);
                const job = new commandFile.default(this);
                this.jobs.set(job.name, job);
                console.log(`Initialized ${job.name}`)
                setInterval(async () => {
                  await  job.execute()
                }, job.interval)
            }
        });
    }
    public async loadCommands() {
       readdirSync(`${__dirname}/../../bot/commands`).forEach(async (file) => {
           if(file.endsWith("js")) {
               const commandFile = await import(`../../bot/commands/${file}`);
               const command: BaseCommand = new commandFile.default(this);
               console.log(`Loaded ${command.name}`)
               this.commands.set(command.name, command);
               //@ts-ignore
               this.commandData.push(command.data.toJSON());
           }
       });
       try {
		console.log('Started refreshing application (/) commands.');

        setTimeout(async () => {
            console.log(this.commandData)
        this.restData = new REST({ version: '9' }).setToken(this.token ?? "a");
	await this.restData.put(
			Routes.applicationGuildCommands(this?.user?.id || "", process.env.GUILD || ""),
			{ body: this.commandData },
		);
		console.log('Successfully reloaded application (/) commands.');
    }, 1000);
	} catch (error) {
		this.logger.logError(error, __filename)
	}
    }

    public async loadEvents() {
        readdirSync(`${__dirname}/../../bot/events`).forEach(async (file) => {
            if(file.endsWith("js")) {
                const eventFile = await import(`../../bot/events/${file}`);
                const event: BaseEvent = new eventFile.default(this);
                this.on((event.name), (...args) => event.execute(...args));
                console.log(`loaded ${event.name}`)
            }
        });
    }

}