export type ASTType = string | ASTHigherType;

export class ASTHigherType {
  constructor(public name: string, public args: ASTType[]) {}
}

export class ASTField {
  constructor(public name: string, public type: ASTType) {}
}

export class ASTServiceField<T = ASTFunction | ASTType> {
  constructor(public name: string, public type: T) {}
}

export class ASTStruct {
  constructor(public name: string, public fields: ASTField[]) {}
}

export class ASTService {
  constructor(public name: string, public methods: ASTServiceField[]) {}
}

export class ASTFunction {
  constructor(
    public input: ASTField[],
    public output: ASTType,
    public reversed: boolean = false,
  ) {}
}

export type ASTTopLevel = ASTStruct | ASTService;
