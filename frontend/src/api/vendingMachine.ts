import axios from 'axios';

axios.defaults.withCredentials = true;
export interface VendingMachineRecord {
    id: number;
    lat: string;       // numeric columns come across as strings by default
    lon: string;       // same here
    location: string;
    desc: string;
    available: boolean;
    items: string;     // stored in DB as JSON‐encoded text
    imageUrl?: string;
    createdAt: string; // timestamp string
    reviewsCount?: number; // not being returned atm
    rating?: number; // not being returned atm
}

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/vending-machine`;


export async function getAllMachines() {
    const response = await axios.get<VendingMachineRecord[]>(`${import.meta.env.VITE_BACKEND_URL}/api/vending-machine`,
    { withCredentials: true } );
    return response.data;
}

export async function getMachine(id: number){
    const response = await axios.get<VendingMachineRecord>(`${import.meta.env.VITE_BACKEND_URL}/api/vending-machine/${id}`,
    { withCredentials: true } );
    return response.data;
}
export async function patchMachineItems(
    id: number,
    items: { name: string; available: boolean }[]
): Promise<void> {
    const form = new FormData();
    form.append('items', JSON.stringify(items));
    await axios.patch(
        `${BASE}/${id}`,
        form,
        {
            withCredentials: true,
        }
    );
}
