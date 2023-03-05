import { mainService } from './services/MainService';
import { sophon } from './sophon';
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

sophon.mount(io, mainService);

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});
