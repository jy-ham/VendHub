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

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('User not authenticated');
    return {
        'Authorization': `Bearer ${token}`,
    };
}

export async function getAllMachines() {
    const response = await axios.get<VendingMachineRecord[]>(`${import.meta.env.VITE_BACKEND_URL}/api/vending-machine`,
        { withCredentials: true } );
    return response.data;
}

export async function getMachine(id: number): Promise<VendingMachineRecord> {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            ...getAuthHeaders(),
        },
    });
    if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || res.statusText);
    }
    return await res.json();
}

export async function patchMachineItems(
    id: number,
    items: { name: string; available: boolean }[],
    available: boolean
): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            items: JSON.stringify(items),
            available: available.toString(),
        }),
    });
    if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || res.statusText);
    }
}
