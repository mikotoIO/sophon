import { ZodArray, ZodObject, ZodType, z } from 'zod';

export abstract class HSValue {
  type: string;
  constructor() {
    this.type = 'unknown';
  }
}

export class HSString extends HSValue {
  type: 'str';
  constructor() {
    super();
    this.type = 'str';
  }
}

export class HSNumber extends HSValue {
  type: 'num';
  numeric: 'i' | 'f' | 'u' | 'n' | 'd';
  bits: number;

  constructor(zt: z.ZodNumber) {
    super();
    this.type = 'num';

    // check if def has integer flag
    const isInt = !!zt._def.checks.find((c) => c.kind === 'int');
    this.numeric = isInt ? 'i' : 'f';
    this.bits = isInt ? 32 : 64;
  }
}

export class HSBoolean extends HSValue {
  type: 'bool';
  constructor() {
    super();
    this.type = 'bool';
  }
}

export class HSArray extends HSValue {
  type: 'array';
  items: HSValue;
  constructor(zt: ZodArray<any>) {
    super();
    this.type = 'array';
    this.items = toHyperschema(zt._def.type);
  }
}

export class HSStruct extends HSValue {
  type: 'struct';
  members: { key: string; value: HSValue }[];

  constructor(zt: ZodObject<any>) {
    super();
    this.type = 'struct';
    this.members = Object.entries(zt.shape).map(([key, value]) => ({
      key,
      value: toHyperschema(value as any),
    }));
  }
}

export function toHyperschema(zt: ZodType): HSValue {
  if (zt instanceof z.ZodString) {
    return new HSString();
  }
  if (zt instanceof z.ZodNumber) {
    return new HSNumber(zt);
  }
  if (zt instanceof z.ZodBoolean) {
    return new HSBoolean();
  }
  if (zt instanceof z.ZodArray) {
    return new HSArray(zt);
  }
  if (zt instanceof z.ZodObject) {
    return new HSStruct(zt);
  }
  throw new Error(`Unsupported Zod type: ${zt.constructor.name}`);
}

export async function loadHyperschemaModule(modulePath: string) {
  const module = await import(modulePath);
  const zodItems = Object.entries(module).filter(
    ([key, value]) => value instanceof ZodType,
  );
  const hs: Record<string, HSValue> = {};
  for (const [key, value] of zodItems) {
    hs[key] = toHyperschema(value as ZodType);
  }
  return hs;
}
