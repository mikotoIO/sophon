import { Server, Socket } from 'socket.io';

export class SophonError {
  constructor(private body: unknown) {}
  toJSON() {
    return this.body;
  }
}

export function createHandler(
  rootService: any,
): (socket: Socket, event: string, ...args: any[]) => void {
  return (socket, event, ...args) => {
    const cb = args.pop();
    const namespaces = event.split('/');
    const method = namespaces.pop();
    const service = namespaces.reduce((s, x) => (s as any)[x], rootService);

    if (!service) return;
    const handler = (service as any)[method!];
    if (handler) {
      const result = handler(new SophonInstance(socket), ...args);
      result
        .then((x: any) => cb({ok: x}))
        .catch((e: any) => {
          cb({ err: e });
        });
    }
  };
}

type Sender<T> = (room: string) => T;

interface SophonRouterConstructorOptions<Context> {
  connect: (obj: {
    id: string;
    readonly params: Record<string, string>;
  }) => Context;
}

export class SophonRouter<Context> {
  private io!: Server;
  private options: SophonRouterConstructorOptions<Context>;

  constructor(options: SophonRouterConstructorOptions<Context>) {
    this.options = options;
  }

  create<T, S>(
    creator: ((fn: () => T, meta: any) => any) & {
      SENDER: { new (sender: SenderCore, room: string): S };
    },
    fn: T,
  ) {
    return creator(() => fn, {
      senderFn: (room: string) =>
        new creator.SENDER(new SenderCore(this.io), room),
    }) as T & { $: Sender<S> };
  }

  mount(io: Server, rootService: any) {
    this.io = io;
    const handler = createHandler(rootService);
    io.on('connection', (socket) => {
      const ctxSetup = this.options.connect({
        id: socket.id,
        params: socket.handshake.query as any,
      });
      for (const ctxKey in ctxSetup) {
        socket.data[ctxKey] = ctxSetup[ctxKey];
      }

      socket.onAny((event, ...args) => {
        handler(socket, event, ...args);
      });
    });
  }
}

export class SophonInstance<T = any> {
  public id: string;
  public data: T;

  constructor(private socket: Socket) {
    this.id = socket.id;
    this.data = socket.data as any;
  }

  join(room: string) {
    this.socket.join(room);
  }
  leave(room: string) {
    this.socket.leave(room);
  }
}

export class SenderCore {
  constructor(private io: Server) {}
  emit(room: string, event: string, ...args: any[]) {
    this.io.to(room).emit(event, ...args);
  }
}
