import { Server, Socket } from 'socket.io';

export interface SophonService {
  NAMESPACE: string;
}

export function createHandler(
  services: SophonService[],
): (socket: Socket, event: string, ...args: any[]) => void {
  const serviceMap: Record<string, SophonService> = {};
  services.forEach((x) => {
    serviceMap[x.NAMESPACE] = x;
  });

  return (socket, event, ...args) => {
    const cb = args.pop();
    const namespaces = event.split('/');
    const method = namespaces.pop();

    const service = namespaces.reduce(
      (s, x) => (s as any)[x],
      serviceMap['Main'],
    );

    if (!service) return;
    const handler = (service as any)[method!];
    if (handler) {
      const boundHandler = handler.bind(service);
      const result = boundHandler(new SophonInstance(socket), ...args);
      result
        .then((x: any) => cb(x))
        .catch((e: any) => {
          console.log(e);
          cb('error!');
        });
    }
  };
}

export class SophonRouter {
  private io!: Server;

  createService<T extends SophonService>(fn: () => { new (): T }): T {
    const ctor = fn();
    const service = new ctor();
    (service as any).$ = (room: string) => {
      return new (ctor as any).SENDER(new SenderCore(this.io), room);
    };

    return service;
  }

  mount(io: Server, services: SophonService[]) {
    this.io = io;
    const handler = createHandler(services);
    io.on('connection', (socket) => {
      socket.join('main');

      socket.onAny((event, ...args) => {
        handler(socket, event, ...args);
      });
    });
  }
}

export class SophonInstance {
  constructor(private socket: Socket) {}
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
