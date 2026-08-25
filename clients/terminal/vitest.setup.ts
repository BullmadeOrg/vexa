class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(String(key)) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(String(key)); }
  setItem(key: string, value: string): void { this.values.set(String(key), String(value)); }
}

// Node 22 exposes an unavailable experimental localStorage getter unless launched with a file.
// Replace it in tests so behavior is identical locally and in GitHub Actions.
const local = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: local });
Object.defineProperty(window, "localStorage", { configurable: true, value: local });
