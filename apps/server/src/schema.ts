// Generated by Sophon Schema. Do not edit manually!
import { SophonInstance, SenderCore } from '@sophon-js/server';

// extend as you need
export interface SophonContext {}

export interface Person {
  name: string;
  age: number;
}

// Services

export class MainServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  ping(n: number) {
    this.sender.emit(this.room, 'ping', n);
  }
}

export interface IMainService {
  child: IChildService;
  adder(ctx: SophonInstance<SophonContext>, x: number, y: number): Promise<number>;
  hello(ctx: SophonInstance<SophonContext>, p: Person): Promise<string>;
}

function fnMainService(
  fn: (props: {
    $: (room: string) => MainServiceSender,
  }) => IMainService,
    meta: { senderFn: (room: string) => MainServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const MainService = Object.assign(fnMainService, {
  SENDER: MainServiceSender,
});


export class ChildServiceSender {
  constructor(private sender: SenderCore, private room: string) {}
  pong(s: string) {
    this.sender.emit(this.room, 'child/pong', s);
  }
}

export interface IChildService {
  
  hello(ctx: SophonInstance<SophonContext>): Promise<string>;
}

function fnChildService(
  fn: (props: {
    $: (room: string) => ChildServiceSender,
  }) => IChildService,
    meta: { senderFn: (room: string) => ChildServiceSender },
) {
  const obj = fn({ $: meta.senderFn });
  return Object.assign(obj, { $: meta.senderFn });
}

export const ChildService = Object.assign(fnChildService, {
  SENDER: ChildServiceSender,
});

