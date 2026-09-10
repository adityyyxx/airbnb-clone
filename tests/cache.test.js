const cache = require('../utils/cacheUtil');

describe('In-Memory Cache Utility Suite', () => {
  beforeEach(() => {
    cache.flush();
  });

  afterAll(() => {
    cache.flush();
  });

  test('set and get item before expiration', () => {
    cache.set('test:key', { name: 'Villa Beach' }, 10);
    const item = cache.get('test:key');
    expect(item).toEqual({ name: 'Villa Beach' });
  });

  test('get returns null for non-existent key', () => {
    const item = cache.get('non:existent');
    expect(item).toBeNull();
  });

  test('get returns null and deletes expired key', () => {
    // Set item with 0 (or simulated past expiry)
    cache.set('test:expired', 'hello', 1);
    const entry = cache.store.get('test:expired');
    entry.expiresAt = Date.now() - 1000; // force expiration

    expect(cache.get('test:expired')).toBeNull();
    expect(cache.store.has('test:expired')).toBe(false);
  });

  test('del deletes specific key', () => {
    cache.set('item:1', 'apple', 60);
    cache.set('item:2', 'banana', 60);
    cache.del('item:1');

    expect(cache.get('item:1')).toBeNull();
    expect(cache.get('item:2')).toBe('banana');
  });

  test('delPrefix deletes all matching prefix keys', () => {
    cache.set('homes:index', ['homeA'], 60);
    cache.set('homes:all', ['homeA', 'homeB'], 60);
    cache.set('home:detail:123', { id: 123 }, 60);
    cache.set('services:catalogue', ['chef'], 60);

    cache.delPrefix('homes:');

    expect(cache.get('homes:index')).toBeNull();
    expect(cache.get('homes:all')).toBeNull();
    expect(cache.get('home:detail:123')).toEqual({ id: 123 });
    expect(cache.get('services:catalogue')).toEqual(['chef']);
  });

  test('getOrSet returns cached data without calling fetchFn on hit', async () => {
    const fetchFn = jest.fn().mockResolvedValue(['item1', 'item2']);

    const first = await cache.getOrSet('items:list', 60, fetchFn);
    expect(first).toEqual(['item1', 'item2']);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    const second = await cache.getOrSet('items:list', 60, fetchFn);
    expect(second).toEqual(['item1', 'item2']);
    expect(fetchFn).toHaveBeenCalledTimes(1); // No second DB call
  });

  test('getOrSet stampede protection: concurrent calls only trigger fetchFn once', async () => {
    let callCount = 0;
    const fetchFn = jest.fn().mockImplementation(async () => {
      callCount++;
      // Simulate 50ms async DB latency
      await new Promise(resolve => setTimeout(resolve, 50));
      return { data: 'query result' };
    });

    // 10 concurrent requests arrive at the exact same moment
    const promises = Array.from({ length: 10 }, () =>
      cache.getOrSet('concurrent:key', 60, fetchFn)
    );

    const results = await Promise.all(promises);

    expect(callCount).toBe(1);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    results.forEach(res => {
      expect(res).toEqual({ data: 'query result' });
    });
  });
});
