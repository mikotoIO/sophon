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
// maps between Sophon types and TypeScript types

class TypeScriptGenerator {
  constructor(private ast: ASTTopLevel[]) {
    ast.forEach((x) => this.typeSet.add(x.name));
  }

  typeSet = new Set<string>();

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
    return `export interface ${struct.name} {
${struct.fields.map((f) => `  ${this.genField(f)};`).join('\n')}
}`;
  }

  genStructs() {
    return this.ast
      .filter((x): x is ASTStruct => x instanceof ASTStruct)
      .map((x) => this.genStruct(x))
      .join('\n\n');
  }

  genField(field: ASTField): string {
    return `${field.name}: ${this.toType(field.type)}`;
  }
}

const typeMap: Record<string, string> = {
  string: 'string',
  int: 'number',
  double: 'number',
  boolean: 'boolean',
  void: 'void',
  SophonInstance: 'SophonInstance',
};

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
    if (child === 'Main') return [];
    const path = [this.fieldNames[child]];
    let parent = this.childToParent[child];
    while (parent !== 'Main') {
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

  const l = services.map((svc) => {
    const allMethods = svc.methods.filter(
      (x): x is ASTServiceField<ASTFunction> => x.type instanceof ASTFunction,
    );
    const methods = allMethods.filter((x) => !x.type.reversed);
    const reversedMethods = allMethods.filter((x) => x.type.reversed);
    const services = svc.methods.filter(
      (x): x is ASTServiceField<string> => !(x.type instanceof ASTFunction),
    );

    return t`
export class ${svc.name}ServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  ${ts(
    reversedMethods.map(
      (fn) => t`
${fn.name}(${fn.type.input.map((f) => tg.genField(f))}) {
  this.sender.emit(this.room, '${[
    ...serviceTree.getPath(svc.name),
    fn.name,
  ].join('/')}', ${fn.type.input.map((f) => f.name).join(', ')});
}`,
    ),
  )}
}

export abstract class Abstract${svc.name}Service {
  readonly NAMESPACE = '${svc.name}';
  static readonly SENDER = ${svc.name}ServiceSender;
  readonly $!: (room: string) => ${svc.name}ServiceSender;
  ${ts(services.map((s) => `abstract ${s.name}: Abstract${s.type}Service;`))}
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
}`;
  });

  return t`// Generated by Sophon Schema. Do not edit manually!
import { SophonInstance, SenderCore } from '@sophonjs/server';


${tg.genStructs()}

// Services

${ts(l, '\n\n')}
`.build();
}

function lowerFirstCharacter(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

export function typescriptSocketIOClient(tree: ASTTopLevel[]): string {
  const tg = new TypeScriptGenerator(tree);
  const services = tree.filter((x): x is ASTService => x instanceof ASTService);
  const serviceTree = new ServiceTree(services);

  return t`// Generated by Sophon Schema. Do not edit manually!
import io, { Socket } from 'socket.io-client';


${tg.genStructs()}

class SocketClient {
  constructor(public socket: Socket) {}

  call(event: string, ...args: any[]): any {
    return new Promise((resolve) => {
      this.socket.emit(event, ...args, resolve);
    });
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
class ${svc.name}Client {
  ${ts(services.map((x) => `readonly ${x.name}: ${x.type}Client;`))}
  constructor(private socket: SocketClient) {
    ${ts(services.map((x) => `this.${x.name} = new ${x.type}Client(socket);`))}
  }
  ${ts(
    methods.map((m) => {
      return `${m.name}(${m.type.input
        .map((x) => tg.genField(x))
        .join(', ')}): Promise<${tg.toType(m.type.output)}> {
  return this.socket.call('${serviceTree.pathString(
    svc.name,
    m.name,
  )}', ${m.type.input.map((x) => x.name).join(', ')});
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

export function createClient(url: string) {
  return new Promise<MainClient>((resolve) => {
    const socket = io(url);

    socket.once('connect', () => {
      const socketClient = new SocketClient(socket);
      resolve(new MainClient(socketClient));
    });
  });
}
`.build();
}
