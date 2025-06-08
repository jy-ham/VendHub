import { describe, it, expect, vi } from 'vitest';
import { vendMachine } from '../api/vendingMachineDB.js';

// Mock supabase storage functions
const mockUpload = vi.fn().mockResolvedValue({ error: null });
const mockGetPublicUrl = vi.fn().mockReturnValue({
  data: { publicUrl: 'https://fakeurl.com/image.png' },
});

// Helper to create a mock File object (simulate browser File API)
function createMockFile() {
  const buffer = Buffer.from('fake image content');
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], 'test.png', { type: 'image/png' });
  return file;
}

vi.mock('../api/dbConnection', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  },
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue(undefined),
  },
}));


beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('POST /vending-machine', () => {
  it('returns 201 and success message with valid data', async () => {
    const file = createMockFile();

    // Create a multipart/form-data request body
    const formData = new FormData();
    formData.append('lat', '12.345678');
    formData.append('lon', '98.765432');
    formData.append('location', 'Test location');
    formData.append('desc', 'Test description');
    formData.append('available', 'true');
    formData.append('items', 'item1,item2');
    formData.append('image', file);

    // Convert FormData to Request
    const req = new Request('https://test/vending-machine', {
      method: 'POST',
      body: formData,
    });

    const res = await vendMachine.request(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toBe('Vending machine added successfully');

    expect(mockUpload).toHaveBeenCalled();
    expect(mockGetPublicUrl).toHaveBeenCalled();
  });

    it('returns 400 if required fields or image are missing', async () => {
    const formData = new FormData(); // missing everything

    const req = new Request('https://test/vending-machine', {
      method: 'POST',
      body: formData,
    });

    const res = await vendMachine.request(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields or image file');
  });
});
