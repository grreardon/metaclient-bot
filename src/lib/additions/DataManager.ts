import CacheManager from "./CacheManager";
import DatabaseManager from "./DatabaseManager";
import { Filter, Document } from "mongodb"
import BetterClient from "../extensions/BetterClient";
import { connectionObject, user } from "../types";

export default class DataManager  {
  public readonly cacheManager: CacheManager;
  public readonly dbManager: DatabaseManager;
  private client: BetterClient;

  
  constructor({ uri, mongoData, redisData }: connectionObject, c: BetterClient) {
    this.cacheManager = new CacheManager(redisData);
    this.dbManager = new DatabaseManager(uri, mongoData);
    this.client = c;
  }

  public async login() {
    await this.dbManager.login();
  }

  public async get(collectionName: string, id: string, prefix: string): Promise<user | {}>{
    const fromCache = await this.cacheManager.cache.get(`${prefix}-${id}`).catch(err => console.log(err));
    let cacheObject: user;
    if(fromCache != null) {
         cacheObject = JSON.parse(fromCache);
       //  console.log("From Cache")
         return cacheObject;
    } else {
         const fromDB = await this.dbManager.get(collectionName, {_id: id}).catch(err => console.log(err));
         if(fromDB?._id) 
         {
        //   console.log("From DB")
           await this.cacheManager.cache.set(`${prefix}-${fromDB?._id}`, JSON.stringify(fromDB));
           return fromDB;
         }
       //  console.log("Not found")
         return {};
    } 
  }

  public async set(collectionName: string, filter: Filter<Document>, updateData: Object, prefix: string) {
    try {
    const oldData = await this.get(collectionName, filter._id , prefix);
    if(oldData) updateData = {
      _id: filter._id,
      ...oldData,
      ...updateData
    }
    //@ts-ignore
    await this.cacheManager.cache.set(`${prefix}-${filter._id}`, JSON.stringify(updateData));
    await this.dbManager.set(collectionName, filter, {$set: updateData});
    } catch(err) {
      this.client.logger.logError(err, __filename);
    }
  }

  public async delete(collectionName: string, id: string, prefix: string) {
    try {
    await this.dbManager.db?.collection(collectionName).findOneAndDelete({_id: id});
    await this.cacheManager.cache.del(`${prefix}-${id}`);
    } catch(err) {
      await this.client.logger.logError(err, __filename)
    }
  }
}