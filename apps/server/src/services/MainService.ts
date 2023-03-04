import { Person, AbstractMainService, AbstractChildService } from '../schema';
import { sophon } from '../sophon';
import { SophonInstance } from '@sophonjs/server';

export const childService = sophon.createService(
  () =>
    class ChildService extends AbstractChildService {
      async hello(ctx: SophonInstance): Promise<string> {
        ctx.join('child');
        return `Hello child!`;
      }
    },
);

export const mainService = sophon.createService(
  () =>
    class MainService extends AbstractMainService {
      readonly child = childService;

      async adder(ctx: SophonInstance, x: number, y: number): Promise<number> {
        return x + y;
      }

      async hello(ctx: SophonInstance, p: Person): Promise<string> {
        ctx.join('main');
        this.$('main').ping(42069);
        return `Hello ${p.name}!`;
      }
    },
);
