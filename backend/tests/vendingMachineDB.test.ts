import { describe, it, expect, vi } from 'vitest';
import { vendMachine } from '../api/vendingMachineDB.js';

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
    const req = new Request('https://test/vending-machine/41', {
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
