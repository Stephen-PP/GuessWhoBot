import { RedisClientType, createClient } from "redis";

export class StorageModel {
    private static client: RedisClientType;

    constructor(){
        StorageModel.client = createClient({
            url: "redis://192.168.1.251:6379"
        });
    }
}

new StorageModel();