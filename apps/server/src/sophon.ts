import { SophonRouter } from '@sophonjs/server';
import { SophonContext } from './schema';

declare module './schema' {
  interface SophonContext {
    count: number;
  }
}

export const sophon = new SophonRouter<SophonContext>({
  connect: ({}) => {
    return {
      count: 0,
    };
  },
});
