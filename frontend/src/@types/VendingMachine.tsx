export interface VendingMachine {
    id?: number;
    location: string;
    desc: string;
    available: boolean;
    lat: number;
    lon: number;
    items: string;
}