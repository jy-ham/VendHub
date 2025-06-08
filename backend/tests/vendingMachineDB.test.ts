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

describe('GET /api/vending-machine', () => {
  it('should return an array of vending machines', async () => {
    const req = new Request('https://test/vending-machine', {
      method: 'GET'
    });

    const res = await vendMachine.request(req);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      const machine = data[0];

      expect(typeof machine.id).toBe('number');
      expect(typeof machine.id).toBe('number');
      expect(typeof machine.lat === 'string' || typeof machine.lat === 'number').toBe(true);
      expect(typeof machine.lon === 'string' || typeof machine.lon === 'number').toBe(true);
      expect(typeof machine.location).toBe('string');
      expect(typeof machine.desc).toBe('string');
      expect(typeof machine.available).toBe('boolean');
      expect(typeof machine.items).toBe('string');
      expect(machine.imageUrl === null || typeof machine.imageUrl === 'string').toBe(true);
      expect(typeof machine.createdAt).toBe('string');
    }
  });
});

describe('GET /vending-machine/:id', () => {
  it('should return a vending machine', async () => {
    const req = new Request('https://test/vending-machine/1', {
      method: 'GET'
    });

    const res = await vendMachine.request(req);

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(typeof data.id).toBe('number');
    expect(typeof data.id).toBe('number');
    expect(typeof data.lat === 'string' || typeof data.lat === 'number').toBe(true);
    expect(typeof data.lon === 'string' || typeof data.lon === 'number').toBe(true);
    expect(typeof data.location).toBe('string');
    expect(typeof data.desc).toBe('string');
    expect(typeof data.available).toBe('boolean');
    expect(typeof data.items).toBe('string');
    expect(data.imageUrl === null || typeof data.imageUrl === 'string').toBe(true);
    expect(typeof data.createdAt).toBe('string');
  });
});

describe('POST /vending-machine', () => {
  let mockVendMachine: any;
  beforeEach(async () => {
    mockUpload.mockClear();
    mockGetPublicUrl.mockClear();
    vi.resetModules();

    vi.doMock('../api/dbConnection', () => ({
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
    
    const module = await import('../api/vendingMachineDB.js');
    mockVendMachine = module.vendMachine;
  });

  afterEach(() => {
    vi.resetModules();
    vi.unmock('../api/dbConnection');
  });
  
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

    const res = await mockVendMachine.request(req);
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

    const res = await mockVendMachine.request(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing required fields or image file');
  });
});
