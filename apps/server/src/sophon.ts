import { SophonRouter } from '@sophon-js/server';
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
