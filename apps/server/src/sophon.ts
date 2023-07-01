import { SophonCore } from '@sophon-js/server';
import { SophonContext } from './schema';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { MainService } from './services/MainServiceNext';

declare module './schema' {
  interface SophonContext {
    count: number;
  }
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

export const sophon = new SophonCore<SophonContext>(io, {
  connect: ({}) => {
    return {
      count: 0,
    };
  },
});

sophon.boot(new MainService(sophon))

export function boot(port: number, cb: () => void) {
  httpServer.listen(port, cb);
}
