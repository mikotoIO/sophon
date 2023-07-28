import { ZodType, z } from 'zod';
import path from 'path';
import { HSValue, loadHyperschemaModule, toHyperschema } from './types';

// const Human = z.object({
//   name: z.string(),
//   age: z.number().int(),
//   pets: z.array(z.string()),
// });
// type Human = z.infer<typeof Human>;

// console.log(JSON.stringify(toHyperschema(Human), null, 2));
// console.log(z.string().nullish())

async function main() {
  console.log(
    JSON.stringify(
      await loadHyperschemaModule(path.join(__dirname, './schema')),
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
