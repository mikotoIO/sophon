import { MainService, ChildService } from '../schema';
import { sophon } from '../sophon';

const childService = sophon.create(ChildService, {
  async hello(ctx) {
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
