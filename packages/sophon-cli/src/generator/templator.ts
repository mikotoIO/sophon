class Templator {
  constructor(public lines: string[]) {}

  build(indent: number = 0) {
    return this.lines.map((x) => ' '.repeat(indent) + x).join('\n');
  }
}

type TmplArg = string | Templator;

function countEndSpaces(s: string) {
  let i = s.length - 1;
  while (i >= 0 && s[i] === ' ') i--;
  return s.length - 1 - i;
}

export function ts(args: TmplArg[], separator = '\n') {
  return new Templator(
    args
      .map((x) => (x instanceof Templator ? x.build() : x))
      .join(separator)
      .split('\n'),
  );
}

export function t(s: TemplateStringsArray, ...args: (TmplArg | TmplArg[])[]) {
  let st = '';
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (Array.isArray(arg)) {
    }

    if (arg instanceof Templator) {
      const count = countEndSpaces(s[i]);
      st += s[i] + arg.build(count).slice(count);
    } else {
      st += s[i] + arg;
    }
  }

  st += s[s.length - 1];
  return new Templator(st.trimStart().split('\n'));
}
