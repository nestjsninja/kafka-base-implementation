export class Env {
  static getValue(key: string): string | undefined;
  static getValue(key: string, defaultValue: string): string;
  static getValue(key: string, defaultValue?: string): string | undefined {
    const serverKey = key.startsWith('SERVER__') ? key : `SERVER__${key}`;

    return process.env[serverKey] ?? process.env[key] ?? defaultValue;
  }

  static getIntValue(key: string): number | undefined;
  static getIntValue(key: string, defaultValue: number): number;
  static getIntValue(key: string, defaultValue?: number): number | undefined {
    const value = Env.getValue(key);
    const parsed = value ? Number.parseInt(value, 10) : undefined;

    return Number.isInteger(parsed) ? parsed : defaultValue;
  }
}
