import { Server, Socket } from 'socket.io';

export class SophonInstance {
  constructor(private socket: Socket) {
  }
  join(room: string) {
    this.socket.join(room);
  }
  leave(room: string) {
    this.socket.leave(room);
  }
}

export class SenderCore {
  constructor(private io: Server) {
  }
  emit(room: string, event: string, ...args: any[]) {
    this.io.to(room).emit(event, ...args);
  }
}