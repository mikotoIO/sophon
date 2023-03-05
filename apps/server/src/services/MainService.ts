import { MainService, ChildService } from '../schema';
import { SophonError } from '@sophonjs/server';
import { sophon } from '../sophon';

const childService = sophon.create(ChildService, {
  async hello(ctx) {
    if (ctx.data.count === 10) throw new SophonError({ message: 'count is 10' });
    return `hello, ${ctx.data.count++}`;
  },
});

export const mainService = sophon.create(MainService, {
  child: childService,

  async hello(ctx, p) {
    ctx.join('room1');
    mainService.$('room1').ping(40000);
    return 'hello, world!';
  },

  async adder(ctx, x, y) {
    return x + y;
  },
});
