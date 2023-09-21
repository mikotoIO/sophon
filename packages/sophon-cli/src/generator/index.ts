import { ASTStruct, ASTTopLevel } from '../parser/ast';
import { pythonClient } from './python';
import {
  typescriptSocketIOClient,
  typescriptSocketIOServer,
} from './typescript';

export const generatorMap: Record<string, (tree: ASTTopLevel[]) => string> = {
  'ts-socketio-server': typescriptSocketIOServer,
  'ts-socketio-client': typescriptSocketIOClient,
  'python-client': pythonClient,
};
