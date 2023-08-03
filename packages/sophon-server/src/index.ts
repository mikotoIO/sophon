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
      const boundHandler = handler.bind(service);
      const result = boundHandler(new SophonInstance(socket), ...args);
      result
        .then((x: any) => {
          cb({ ok: x });
        })
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
    join: (room: string) => void;
  }) => Context | Promise<Context>;

  disconnect?: (ctx: Context) => void;
}

// the newer API
export class SophonCore<Context> {
  public senderCore: SenderCore;
  constructor(
    private io: Server,
    private options: SophonRouterConstructorOptions<Context>,
  ) {
    this.senderCore = new SenderCore(io);
  }

  boot(rootService: any) {
    const handler = createHandler(rootService);
    this.io.on('connection', async (socket) => {
      // setup socket context
      try {
        const ctxSetup = await this.options.connect({
          id: socket.id,
          params: socket.handshake.query as any,
          join: (room) => socket.join(room),
        });
        for (const ctxKey in ctxSetup) {
          socket.data[ctxKey] = ctxSetup[ctxKey];
        }
        socket.emit('ready');
      } catch (e) {
        socket.disconnect(true);
        return;
      }

      // TODO: Explain handler
      socket.onAny((event, ...args) => {
        handler(socket, event, ...args);
      });

      socket.on('disconnecting', () => {
        this.options.disconnect?.(socket.data as any);
      });
    });
  }

  joinAll(selector: string, target: string) {
    return this.io
      .in(selector)
      .fetchSockets()
      .then((sockets) => {
        sockets.forEach((s) => {
          s.join(target);
        });
      });
  }

  leaveAll(selector: string, target: string) {
    return this.io
      .in(selector)
      .fetchSockets()
      .then((sockets) => {
        sockets.forEach((s) => {
          s.leave(target);
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
