import { ethers } from "ethers";

export class SmallUtils {

    public static isObjectEmpty(obj: unknown): boolean{
        const object = obj as Record<never, never>;
        // Make sure object is a object, not nullish, and has no keys
        return typeof object === 'object' && object != null && Object.keys(object).length === 0;
    }

    public static truncateAddress(address: string): string{
        return address.slice(0, 6) + "..." + address.slice(-6);
    }

    public static isNumber(str: string){
        return typeof str === 'string' && str.length > 0 && !isNaN(Number(str));
    }
}