export interface Account {
    name: string;
    email: string;
}



export interface Leave {
    StartDate: string;
    EndDate: string;
    Reason: string;
    Status: string;
    createdAt: string;
    updatedAt: string;
    account: Account;
    admin?: {
        name : string ;
        email : string
    }
}