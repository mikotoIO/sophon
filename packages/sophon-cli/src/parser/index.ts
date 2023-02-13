import * as util from 'util';

import {
  buildLexer,
  rule,
  seq,
  tok,
  str,
  apply,
  rep_sc,
  expectEOF,
  expectSingleResult,
  alt,
  opt,
  lrec_sc,
  list_sc,
} from 'typescript-parsec';
import {
  ASTField,
  ASTFunction,
  ASTHigherType,
  ASTService,
  ASTServiceField,
  ASTStruct,
  ASTTopLevel,
  ASTType,
} from './ast';

const fileName = '../schema.sophon';

enum TokenKind {
  Name,
  LBrace,
  RBrace,
  LParen,
  RParen,
  Array,
  Tilde,
  At,
  Question,
  Comma,
  Comment,
  Colon,
  Semicolon,
  Space,
}

const lexer = buildLexer([
  [true, /^[A-Za-z]\w*/g, TokenKind.Name],
  [true, /^{/g, TokenKind.LBrace],
  [true, /^}/g, TokenKind.RBrace],
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [true, /^\[]/g, TokenKind.Array],
  [true, /^\?/g, TokenKind.Question],
  [true, /^~/g, TokenKind.Tilde],
  [true, /^@/g, TokenKind.At],
  [true, /^:/g, TokenKind.Colon],
  [true, /^;/g, TokenKind.Semicolon],
  [true, /^,/g, TokenKind.Comma],
  [false, /^\/\/.*$/gm, TokenKind.Comment],
  [false, /^\s+/g, TokenKind.Space],
]);

const FILE = rule<TokenKind, ASTTopLevel[]>();
const STRUCT = rule<TokenKind, ASTStruct>();
const SERVICE = rule<TokenKind, ASTService>();
const PARAM = rule<TokenKind, ASTField>();
const FIELD = rule<TokenKind, ASTField>();
const TYPE = rule<TokenKind, ASTType>();

PARAM.setPattern(
  apply(
    seq(tok(TokenKind.Name), tok(TokenKind.Colon), TYPE),
    ([name, _, type]) => new ASTField(name.text, type),
  ),
);

TYPE.setPattern(
  apply(
    seq(
      opt(alt(tok(TokenKind.Tilde), tok(TokenKind.At))),
      lrec_sc(
        apply(tok(TokenKind.Name), (t) => t.text),
        alt(tok(TokenKind.Array), tok(TokenKind.Question)),
        (t: ASTType, a) => {
          switch (a.kind) {
            case TokenKind.Array:
              return new ASTHigherType('[]', [t]);
            case TokenKind.Question:
              return new ASTHigherType('?', [t]);
          }
        },
      ),
    ),
    ([a, x]) => {
      if (a === undefined) return x;
      switch (a.kind) {
        case TokenKind.Tilde:
          return new ASTHigherType('~', [x]);
        case TokenKind.At:
          return new ASTHigherType('@', [x]);
      }
    },
  ),
);

FILE.setPattern(rep_sc(alt(STRUCT, SERVICE)));

SERVICE.setPattern(
  apply(
    seq(
      str('service'),
      tok(TokenKind.Name),
      tok(TokenKind.LBrace),
      rep_sc(
        seq(
          opt(tok(TokenKind.Tilde)),
          tok(TokenKind.Name),
          tok(TokenKind.LParen),
          opt(list_sc(PARAM, tok(TokenKind.Comma))),
          tok(TokenKind.RParen),
          opt(apply(seq(tok(TokenKind.Colon), TYPE), (x) => x[1])),
          tok(TokenKind.Semicolon),
        ),
      ),
      tok(TokenKind.RBrace),
    ),
    ([_, name, __, m]) => {
      const methods: ASTServiceField[] = m.map(
        ([prefix, name, _, input, __, output]) => {
          {
            return new ASTServiceField(
              name.text,
              new ASTFunction(
                input ?? [],
                output ?? 'void',
                prefix !== undefined,
              ),
            );
          }
        },
      );

      return new ASTService(name.text, methods);
    },
  ),
);

FIELD.setPattern(
  apply(
    seq(
      tok(TokenKind.Name),
      tok(TokenKind.Colon),
      TYPE,
      tok(TokenKind.Semicolon),
    ),
    ([name, _, type, __]) => new ASTField(name.text, type),
  ),
);

STRUCT.setPattern(
  apply(
    seq(
      str('struct'),
      tok(TokenKind.Name),
      tok(TokenKind.LBrace),
      rep_sc(FIELD),
      tok(TokenKind.RBrace),
    ),
    ([_, name, __, fields]) => new ASTStruct(name.text, fields),
  ),
);

export function parse(file: string) {
  return expectSingleResult(expectEOF(FILE.parse(lexer.parse(file))));
}
