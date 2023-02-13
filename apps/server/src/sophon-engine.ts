import { createServer, Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SophonInstance, SenderCore } from '@sophonjs/server';

interface SophonService {
  NAMESPACE: string;
}

export class SophonEngine {
  private readonly httpServer: HTTPServer;
  private readonly io: Server;

  constructor() {
    this.httpServer = createServer();
    this.io = new Server(this.httpServer, {
      cors: {
        origin: '*',
      },
    });
  }

  createService<T extends SophonService>(fn: () => { new (): T }): T {
    const ctor = fn();
    const service = new ctor();
    (service as any).$ = (room: string) => {
      return new (ctor as any).SENDER(new SenderCore(this.io), room);
    };

    return service;
  }

  listen(services: SophonService[]) {
    const handler = createHandler(services);
    this.io.on('connection', (socket) => {
      socket.join('main');

      socket.onAny((event, ...args) => {
        handler(socket, event, ...args);
      });
    });

    this.httpServer.listen(3000, () => {
      console.log('listening on *:3000');
    });
  }
}

export function createService<T extends SophonService>(
  fn: () => { new (): T },
): T {
  const ctor = fn();
  const service = new ctor();
  // (mainService as any).$ = (room: string) => ({
  //   return (ctor as any).SENDER(io, room);
  // })

  return service;
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
    const [namespace, method] = event.split('/');
    const service = serviceMap[namespace];
    if (!service) return;
    const handler = service[method];
    if (handler) {
      const boundHandler = handler.bind(service);
      const result = boundHandler(...args, new SophonInstance(socket));
      result
        .then((x) => cb(x))
        .catch((e) => {
          console.log(e);
          cb('error!');
        });
    }
  };
}
