import '@testing-library/jest-dom';

// Node 22 ships an experimental global `localStorage` that throws without a
// `--localstorage-file` path and shadows jsdom's. Replace it with a simple
// in-memory implementation so component/store tests can use it freely.
class MemoryStorage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
});
