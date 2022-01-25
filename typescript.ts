import { stripNamespace } from "./convert";
import * as t from "proto-parser";
import { WriteStream } from "fs";

const INDENT = "  ";

export function toTypescriptDefinitions(
  protoDocument: t.ProtoDocument,
): TsNamespace {
  const namespace = new TsNamespace("");
  namespace.list = new Array<TsClassNode | TsEnumNode>();
  var types = Array<string>();

  const mainNamespace = stripNamespace(protoDocument.root);
  const nested = mainNamespace?.nested;
  for (const key in nested) {
    if (Object.prototype.hasOwnProperty.call(nested, key)) {
      const el = nested[key];
      if (el.syntaxType === t.SyntaxType.MessageDefinition) {
        const tscn = new TsClassNode(el.name);
        tscn.fields = new Array<TsClassFields>();

        const md = el as t.MessageDefinition;
        for (const key in md.fields) {
          if (Object.prototype.hasOwnProperty.call(md.fields, key)) {
            const mdEl = md.fields[key];

            let type: string;

            switch (mdEl.type.syntaxType) {
              case t.SyntaxType.BaseType:
                type = "";
                switch (mdEl.type.value) {
                  case "int32":
                    type = "i32";
                    break;
                  case "uint32":
                    type = "u32";
                    break;
                  case "uint64":
                    type = "u64";
                    break;
                  case "int64":
                    type = "i64";
                    break;
                  case "bool":
                    type = "bool";
                    break;
                  case "bytes":
                    type = "Bytes";
                    break;
                  default:
                    type = mdEl.type.value;
                }
                break;
              case t.SyntaxType.Identifier:
                type = mdEl.type.value;
                break;
            }
            if (mdEl.options !== undefined) {
              // force externally defined types base on options.
              for (const [key, val] of Object.entries(mdEl.options)) {
                if (key === "(fig.bytetype)") {
                  if (!types.includes(val)) {
                    types.push(val);
                    namespace.list.unshift(new TsTypeNode(val, "Bytes"));
                  }
                  type = val;
                }
              }
            }
            const tcf = new TsClassFields(mdEl.name, type);
            if (mdEl.repeated) {
              tcf.isArray = true;
            }
            tscn.fields.push(tcf);
          }
        }
        namespace.list.push(tscn);
      } else if (el.syntaxType === t.SyntaxType.EnumDefinition) {
        const ed = el as t.EnumDefinition;

        const tscn = new TsEnumNode(ed.name);
        tscn.values = new Map<string, number>();

        for (const [key, val] of Object.entries(ed.values)) {
          if (Object.prototype.hasOwnProperty.call(ed.values, key)) {
            tscn.values.set(key, val);
          }
        }
        namespace.list.push(tscn);
      }
    }
  }
  return namespace;
}

export function printTypescriptNamespace(ws: WriteStream, n: TsNamespace) {
  ws.write(`export namespace ${n.name} {\n\n`);
  if (n.list !== undefined) {
    for (const l of n.list) {
      const p = l as TsPrintable;
      p.printTypescript(ws);
    }
  }
  ws.write(`}\n`);
  ws.end();
}

interface TsPrintable {
  printTypescript(ws: WriteStream): void;
}

class TsClassNode {
  name: string;
  fields?: Array<TsClassFields>;

  constructor(name: string) {
    this.name = name;
  }

  printTypescript(ws: WriteStream) {
    ws.write(`${INDENT}export class ${this.name} {\n`);

    if (this.fields !== undefined) {
      for (const l of this.fields) {
        l.printTypescript(ws);
      }

      ws.write(`\n${INDENT.repeat(2)}constructor(\n`);
      for (const l of this.fields) {
        ws.write(`${INDENT.repeat(3)}${camelCase(l.name)}: ${l.printType()},\n`);
      }

      ws.write(`${INDENT.repeat(2)}) {\n`);
      for (const l of this.fields) {
        ws.write(`${INDENT.repeat(3)}this.${camelCase(l.name)} = ${camelCase(l.name)};\n`);
      }
      ws.write(`${INDENT.repeat(2)}}\n`);
    }

    ws.write(`${INDENT}}\n\n`);
  }
}

class TsClassFields {
  isPublic: boolean;
  name: string;
  type: string;
  isArray: boolean;

  constructor(name: string, type: string) {
    this.isPublic = true;
    this.name = name;
    this.type = type;
    this.isArray = false;
  }

  printType(): string {
    if (this.isArray) {
      return `Array<${this.type}>`;
    } else {
      return `${this.type}`;
    }
  }

  printTypescript(ws: WriteStream) {
    if (this.isPublic) {
      ws.write(`${INDENT.repeat(2)}public `);
    }
    ws.write(`${camelCase(this.name)}: ${this.printType()}\n`);
  }
}


class TsTypeNode {
  name: string;
  value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }

  printTypescript(ws: WriteStream) {
    ws.write(`${INDENT}export type ${this.name} = ${this.value}\n\n`);
  }

}

class TsEnumNode {
  name: string;
  values: Map<string, number>;

  constructor(name: string) {
    this.name = name;
    this.values = new Map<string, number>();
  }

  printTypescript(ws: WriteStream) {
    ws.write(`${INDENT}export enum ${this.name} {\n`);

    for (const [l, v] of this.values) {
      ws.write(`${INDENT.repeat(2)}${l} = ${v},\n`);
    }

    ws.write(`${INDENT}}\n\n`);
  }
}

class TsNamespace {
  name: string;
  list?: Array<TsClassNode | TsEnumNode | TsTypeNode>;

  constructor(name: string) {
    this.name = name;
  }
}

function camelCase(str: String) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(_match, chr) {
    return chr.toUpperCase();
  });
}
