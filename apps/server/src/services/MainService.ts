import { Person, AbstractMainService } from '../schema';
import { sophon } from '../sophon';
import { SophonInstance } from '@sophonjs/server';

export const mainService = sophon.createService(
  () =>
    class MainService extends AbstractMainService {
      async adder(x: number, y: number): Promise<number> {
        return x + y;
      }

      async hello(p: Person, ctx: SophonInstance): Promise<string> {
        ctx.join('main');
        this.$('main').ping(42069);
        return `Hello ${p.name}!`;
      }
    },
);
