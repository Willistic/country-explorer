import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import axios from 'axios';
import { createApp } from '../src/app.js';

// Force the controller down its built-in fallback path (5 sample countries)
// by making the external API call fail. This keeps the test deterministic and
// offline while still exercising the real filtering/sorting/pagination logic.
vi.mock('axios');

const app = createApp();

beforeEach(() => {
  vi.mocked(axios.get).mockRejectedValue(new Error('external API unavailable'));
});

describe('GET /api/v1/countries', () => {
  it('returns paginated countries with a pagination envelope', async () => {
    const res = await request(app).get('/api/v1/countries?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 5 });
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/api/v1/countries?search=germany');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name.common).toBe('Germany');
  });

  it('filters by region', async () => {
    const res = await request(app).get('/api/v1/countries?region=Europe');

    expect(res.status).toBe(200);
    expect(res.body.data.every((c: { region: string }) => c.region === 'Europe')).toBe(true);
  });

  it('sorts by population descending', async () => {
    const res = await request(app).get('/api/v1/countries?sortBy=population&sortOrder=desc&limit=5');

    const populations = res.body.data.map((c: { population: number }) => c.population);
    const sorted = [...populations].sort((a, b) => b - a);
    expect(populations).toEqual(sorted);
  });
});

describe('unknown routes', () => {
  it('returns a formatted 404', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
