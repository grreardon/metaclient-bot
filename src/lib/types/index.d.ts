import { ColorResolvable, Snowflake} from "discord.js"
import { RedisOptions} from "ioredis"
import { MongoClientOptions } from "mongodb"

interface guildSettings {
  cooldown: number
  messagesNeeded: number,
  nftCat: string,
  factionsCat: string
  supportRole: Snowflake,
  whitelistRole: Snowflake
  }

  interface connectionObject {
    uri: string;
    mongoData: MongoClientOptions;
    redisData: RedisOptions;
  }

  interface user {
    _id: Snowflake
   whitelists: number
  }