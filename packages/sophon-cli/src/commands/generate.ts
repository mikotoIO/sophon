import { Args, Command, Flags } from '@oclif/core';

import * as path from 'path';
import * as fs from 'fs/promises';
import { parse } from '../parser';
import { generatorMap } from '../generator';

export default class Generate extends Command {
  static description = `Generates source code from Sophon schema.`;

  static examples = [`$ sophon generate ./schema.sophon -t ts-socketio-server -o sophon.ts`];

  static args = {
    schema: Args.string({
      description: 'location of the sophon schema',
      required: true,
    }),
  };

  static flags = {
    target: Flags.string({
      char: 't',
      description: 'Generator target',
      required: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Generator output',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Generate);
    const schemaFile = await fs.readFile(
      path.join(process.cwd(), args.schema),
      'utf-8',
    );
    const parsed = parse(schemaFile);
    const genFn = generatorMap[flags.target];
    if (!genFn) {
      this.error(`Generator ${flags.target} not found.`);
    }
    const g = genFn(parsed);
    await fs.writeFile(flags.output, g);
  }
}
