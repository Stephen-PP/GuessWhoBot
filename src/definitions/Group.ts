export interface IGroup {
    name: string,
    addresses: string[],
    history: IGroupHistory[]
}

interface IGroupHistory {
    contract: string,
    action: "revert" | "add"
    addressesBefore: string[],
    addressesAfter: string[]
}