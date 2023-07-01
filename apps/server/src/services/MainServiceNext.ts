import { AbstractChildService, AbstractMainService, Person } from '../schema';
import { SophonInstance } from '@sophon-js/server';

export class ChildService extends AbstractChildService {
  async hello(ctx: SophonInstance) {
    if (ctx.data.count === 10) throw new Error('count is 10');
    return `hello, ${ctx.data.count++}`;
  }
}

export class MainService extends AbstractMainService {
  child = new ChildService(this.sophonCore);

  async hello(ctx: SophonInstance, p: Person) {
    ctx.join('room1');
    this.$('room1').ping(40000);
    return 'hello, world!';
  }

  async adder(ctx: SophonInstance, x: number, y: number) {
    return x + y;
  }
}