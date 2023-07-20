import { RedisClientType, createClient } from "redis";
import { IGroup } from "../definitions/Group";

export class StorageModel {
    private static client: RedisClientType;

    constructor(){
        StorageModel.client = createClient({
            url: "redis://192.168.1.251:6379"
        });
    }

    static async upsertGroup(group: IGroup): Promise<void> {
        await this.client.hSet("groups", group.name, JSON.stringify(group));
    }

    static async getGroups(): Promise<IGroup[]> {
        const groups: IGroup[] = [];
        
        // Get all info from the redis
        const keys = await this.client.hGetAll("groups");

        // Load all keys 
        for(let key of Object.keys(keys)){
            // Add all valid groups to the groups array
            const group = await this.getGroup(key);
            if(group){
                groups.push(group);
            }
        }
        return groups;
    }

    static async getGroup(name: string): Promise<IGroup | false> {
        // Load group
        const group = await this.client.hGet("groups", name);

        // Make sure the group exists in redis
        if(group == null){
            return false;
        }

        // Attempt to parse said group
        try{
            return JSON.parse(group) as IGroup;
        }catch(err){
            return false;
        }
    }

    static async deleteGroup(name: string): Promise<boolean> {
        const group = await this.getGroup(name);

        // Return false if group does not exist
        if(group === false){
            return false;
        }

        // Delete group and return true
        await this.client.hDel("groups", name);
        return true;
    }
}

new StorageModel();