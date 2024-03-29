import {
  ASTField,
  ASTFunction,
  ASTService,
  ASTServiceField,
  ASTStruct,
  ASTTopLevel,
  ASTType,
} from '../parser/ast';
import { t, ts } from './templator';
import * as prettier from 'prettier';
// maps between Sophon types and TypeScript types

const typeMap: Record<string, string> = {
  string: 'string',
  int: 'number',
  double: 'number',
  boolean: 'boolean',
  void: 'void',
  SophonInstance: 'SophonInstance<SophonContext>',
};

const ZodTypeMap: Record<string, string> = {
  string: 'z.string()',
  int: 'z.number().int()',
  double: 'z.number()',
  boolean: 'z.boolean()',
};

class TypeScriptGenerator {
  constructor(private ast: ASTTopLevel[]) {
    ast.forEach((x) => this.typeSet.add(x.name));
  }

  typeSet = new Set<string>();

  toZodType(type: ASTType): string {
    if (typeof type === 'string') {
      if (type in ZodTypeMap) {
        return ZodTypeMap[type];
      }
      if (!this.typeSet.has(type)) {
        throw new Error(`Type "${type}" is not defined`);
      }
      return type;
    }

    switch (type.name) {
      case '[]':
        return `z.array(${this.toZodType(type.args[0])})`;
      case '?':
        return `z.nullable(${this.toZodType(type.args[0])})`;
      default:
        throw new Error(`Generic types not supported yet`);
    }
  }

  toType(type: ASTType): string {
    if (typeof type === 'string') {
      if (type in typeMap) {
        return typeMap[type];
      }
      if (!this.typeSet.has(type)) {
        throw new Error(`Type "${type}" is not defined`);
      }
      return type;
    }

    switch (type.name) {
      case '[]':
        return `${this.toType(type.args[0])}[]`;
      case '?':
        return `${this.toType(type.args[0])} | null`;
      default:
        return `${type.name}<${type.args
          .map((x) => this.toType(x))
          .join(', ')}>`;
    }
  }
  genStruct(struct: ASTStruct): string {
    return `
    export const ${struct.name} = z.object({
      ${struct.fields
        .map((f) => `${f.name}: ${this.toZodType(f.type)},`)
        .join('\n')}
    });
    export type ${struct.name} = z.infer<typeof ${struct.name}>;
    `;
  }

  genStructs() {
    return this.ast
      .filter((x): x is ASTStruct => x instanceof ASTStruct)
      .map((x) => this.genStruct(x))
      .join('\n');
  }

  genField(field: ASTField): string {
    return `${field.name}: ${this.toType(field.type)}`;
  }
}

class ServiceTree {
  childToParent: Record<string, string> = { Main: '.' };
  fieldNames: Record<string, string> = {};

  constructor(private services: ASTService[]) {
    services.forEach((svc) => {
      svc.methods.forEach((field) => {
        if (typeof field.type === 'string') {
          this.childToParent[field.type] = svc.name;
          this.fieldNames[field.type] = field.name;
        }
      });
    });
  }
  getPath(child: string) {
    if (child === 'MainService') return [];
    const path = [this.fieldNames[child]];
    let parent = this.childToParent[child];
    while (parent !== 'MainService') {
      path.push(this.fieldNames[parent]);
      parent = this.childToParent[parent];
    }
    return path.reverse();
  }

  pathString(child: string, ext: string) {
    return [...this.getPath(child), ext].join('/');
  }
}

export function typescriptSocketIOServer(tree: ASTTopLevel[]): string {
  const tg = new TypeScriptGenerator(tree);

  const services = tree.filter((x): x is ASTService => x instanceof ASTService);
  const serviceTree = new ServiceTree(services);

  const computedServices = services.map((svc) => {
    const allMethods = svc.methods.filter(
      (x): x is ASTServiceField<ASTFunction> => x.type instanceof ASTFunction,
    );
    const methods = allMethods.filter((x) => !x.type.reversed);
    const reversedMethods = allMethods.filter((x) => x.type.reversed);
    const services = svc.methods.filter(
      (x): x is ASTServiceField<string> => !(x.type instanceof ASTFunction),
    );

    const sender = t`export class ${svc.name}Sender {
        constructor(private sender: SenderCore, private room: string) {}
        ${ts(
          reversedMethods.map(
            (fn) => t`
          ${fn.name}(${fn.type.input.map((f) => tg.genField(f))}) {
            this.sender.emit(this.room, '${[
              ...serviceTree.getPath(svc.name),
              fn.name,
            ].join('/')}',
            ${fn.type.input.map((f) => f.name).join(', ')});
            }`,
          ),
        )}
    }`.build();

    return t`
    ${sender}

    export abstract class Abstract${svc.name} {
      $: (room: string) => ${svc.name}Sender;
      public constructor(protected sophonCore: SophonCore<SophonContext>) {
        this.$ = (room) => new ${svc.name}Sender(sophonCore.senderCore, room);
      }
      ${ts(services.map((s) => `abstract ${s.name}: Abstract${s.type};`))}
      ${ts(
        methods.map(
          (m) =>
            t`abstract ${m.name}(${ts(
              [new ASTField('ctx', 'SophonInstance'), ...m.type.input].map(
                (field) => tg.genField(field),
              ),
              ', ',
            )}): Promise<${tg.toType(m.type.output)}>;`,
        ),
      )}
    }
    `;
  });

  const final = t`
// Generated by Sophon Schema. Do not edit manually!
import { SophonInstance, SenderCore, SophonCore } from '@sophon-js/server';
import { z } from 'zod';

////////////////////////////////////////
// Types
////////////////////////////////////////

${tg.genStructs()}

////////////////////////////////////////
// Services
////////////////////////////////////////

export interface SophonContext {}
${ts(computedServices)}
`.build();
  return prettier.format(final, { parser: 'typescript' });
}

function lowerFirstCharacter(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

export function typescriptSocketIOClient(tree: ASTTopLevel[]): string {
  const tg = new TypeScriptGenerator(tree);
  const services = tree.filter((x): x is ASTService => x instanceof ASTService);
  const serviceTree = new ServiceTree(services);

  const final = t`// Generated by Sophon Schema. Do not edit manually!
import io, { Socket } from 'socket.io-client';
import { z } from 'zod';


${tg.genStructs()}

class SocketClient {
  constructor(public socket: Socket) {}

  async call(event: string, ...args: any[]): Promise<any> {
    const res = await this.socket.emitWithAck(event, ...args);
    if (res && res.err) {
      throw res.err;
    }
    return res.ok;
  }

  subscribe(ev: string, handler: any) {
    this.socket.on(ev, handler);
    return () => { this.socket.off(ev, handler); };
  }
}

${ts(
  services.map((svc) => {
    const allMethods = svc.methods.filter(
      (x): x is ASTServiceField<ASTFunction> => x.type instanceof ASTFunction,
    );
    const methods = allMethods.filter((x) => !x.type.reversed);
    const reversedMethods = allMethods.filter((x) => x.type.reversed);
    const services = svc.methods.filter(
      (x): x is ASTServiceField<string> => !(x.type instanceof ASTFunction),
    );

    return t`
export class ${svc.name}Client {
  ${ts(services.map((x) => `readonly ${x.name}: ${x.type}Client;`))}
  constructor(private socket: SocketClient) {
    ${ts(services.map((x) => `this.${x.name} = new ${x.type}Client(socket);`))}
  }
  ${ts(
    methods.map((m) => {
      return `${m.name}(${m.type.input
        .map((x) => tg.genField(x))
        .join(', ')}): Promise<${tg.toType(m.type.output)}> {
  return this.socket.call('${serviceTree.pathString(svc.name, m.name)}',
  ${m.type.input.map((x) => x.name).join(', ')});
}`;
    }),
  )}

  ${ts(
    reversedMethods.map((x) => {
      return t`
${x.name}(handler: (${
        x.type.input.map((x) => tg.genField(x)).join(', ') || 'void'
      }) => void) {
  return this.socket.subscribe('${serviceTree.pathString(
    svc.name,
    x.name,
  )}', handler);
}`;
    }),
  )}
}`;
  }),
  '\n\n',
)}

interface CreateClientOptions {
  url: string;
  params?: Record<string, string>;
  onReady?: (client: MainServiceClient) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function createClient(
  options: CreateClientOptions,
) {
  const socket = io(options.url, { query: options.params });

  socket.once('connect', () => {
    socket.once('ready', () => {
      const socketClient = new SocketClient(socket);
      options.onReady?.(new MainServiceClient(socketClient));
    });
  });

  socket.on('connect', () => {
    options.onConnect?.()
  });

  socket.on('disconnect', () => {
    options.onDisconnect?.();
  });

  return () => {
    socket.disconnect();
  };
}
`.build();
  return prettier.format(final, { parser: 'typescript' });
}
