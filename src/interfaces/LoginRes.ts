export interface Account {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
}

export interface LoginRes {
    accessToken: string;
    account: Account;
}

