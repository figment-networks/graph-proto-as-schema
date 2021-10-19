import {stripNamespace} from "./convert";
import * as t from "proto-parser";

import {WriteStream} from "fs";


export function toTypescriptDefinitions(
    protoDocument: t.ProtoDocument
  ): TsNamespace {
    const namespace = new TsNamespace("")
    namespace.list =  new Array<TsClassNode|TsEnumNode>();

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



              tscn.fields.push(new TsClassFields(mdEl.name, mdEl.type.value));
            }
          }
          namespace.list.push(tscn);

          /*
          const otd = new ObjectTypeDefinitionNode(new NameNode(el.name));
          if (
            el.comment !== undefined &&
            el.comment !== "" &&
            el.comment !== null
          ) {
            otd.description = new StringValueNode(el.comment, false);
          }

          otd.directives.push(new DirectiveNode(new NameNode("entity")));
          const fdn = new FieldDefinitionNode(
            new NameNode("id"),
            new NonNullTypeNode(new NamedTypeNode(new NameNode("ID")))
          );
          otd.fields.push(fdn);

          const md = el as t.MessageDefinition;
          for (const key in md.fields) {
            if (Object.prototype.hasOwnProperty.call(md.fields, key)) {
              const mdEl = md.fields[key];
              let tn;
              let name;
              let tValue = mdEl.type.value;
              switch (mdEl.type.syntaxType) {
                case t.SyntaxType.BaseType:
                  name = mdEl.name;
                  switch (mdEl.type.value) {
                    case "int32":
                      tValue = "Int";
                      break;
                    case "uint32":
                    case "uint64":
                    case "int64":
                      tValue = "BigInt";
                      break;
                    case "bool":
                      tValue = "Boolean";
                      break;
                    case "bytes":
                      tValue = "Bytes";
                      break;
                    case "string":
                      tValue = "String";
                      break;
                  }
                  break;
                case t.SyntaxType.Identifier:
                  name = mdEl.name;
                  tValue = mdEl.type.value;
                  break;
              }

              tn = new NamedTypeNode(new NameNode(tValue));
              if  (mdEl.repeated) {
                  if (forceNonNullLists && (mdEl.type.syntaxType == t.SyntaxType.Identifier || tValue == "Bytes")) {
                      tn = new NonNullTypeNode(tn);
                  }
                  tn = new ListTypeNode(tn);
              }

              if (!mdEl.optional) {
                tn = new NonNullTypeNode(tn);
              }

              const fdn = new FieldDefinitionNode(
                new NameNode(name),
                tn as graphql.TypeNode
              );
              if (
                mdEl.comment !== undefined &&
                mdEl.comment !== "" &&
                mdEl.comment !== null
              ) {
                fdn.description = new StringValueNode(mdEl.comment);
              }
              otd.fields.push(fdn);
            }
          }

          arr.push(otd);
          */
        } else if (el.syntaxType === t.SyntaxType.EnumDefinition) {
            /*
          const ed = el as t.EnumDefinition;

          const etd = new EnumTypeDefinitionNode(new NameNode(el.name));
          if (
            el.comment !== undefined &&
            el.comment !== "" &&
            el.comment !== null
          ) {
            etd.description = new StringValueNode(el.comment, false);
          }

          etd.directives?.push(new DirectiveNode(new NameNode("entity")));
          for (const key in ed.values) {
            if (Object.prototype.hasOwnProperty.call(ed.values, key)) {
              // TODO(lukanus): what the hell to do with KV mappings
              let evd = new EnumValueDefinitionNode(new NameNode(key));
              etd.values.push(evd);
            }
          }

          arr.push(etd);
          */
        }
      }
    }

    return namespace
    //return new DocumentNode(arr) as graphql.DocumentNode;
  }


export function printTypescriptNamespace(ws: WriteStream, n: TsNamespace) {
  ws.write(`export namespace ${n.name} { \n`);
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
  printTypescript(ws: WriteStream): void
}

class TsClassNode {
  name: string;
  fields?: Array<TsClassFields>;

  constructor(name:string) {
      this.name = name;
  }

  printTypescript(ws: WriteStream) {
      ws.write(`\texport class ${this.name} { \n`);

      if (this.fields !== undefined) {
        for (const l of this.fields) {
          l.printTypescript(ws);
        }

        ws.write(`\n\t\tconstructor(\n`);
        for (const l of this.fields) {
          ws.write(`\t\t\t${l.name}: ${l.type},\n`);
        }

        ws.write(`\t\t) {\n`);
        for (const l of this.fields) {
          ws.write(`\t\t\tthis.${l.name} = ${l.name};\n`);
        }
        ws.write(`\t\t}\n`);
      }

      ws.write(`\t}\n\n`);
  }
}

class TsClassFields {
  isPublic: boolean;
  name: string;
  type: string;
  isArray: boolean;

  constructor(name:string, type:string) {
      this.isPublic = true;
      this.name = name;
      this.type = type;
      this.isArray = false;
  }


  printTypescript(ws: WriteStream) {
    if (this.isPublic) {
      ws.write(`\t\tpublic `);
    }
    ws.write(`${this.name}: ${this.type}\n `);
  }
}

class TsEnumNode {
  name: string;
  values: Map<string, number>;

  constructor(name: string) {
      this.name = name;
      this.values = new Map<string, number>();
  }
}

class TsNamespace {
  name: string;
  list?: Array<TsClassNode|TsEnumNode>;

  constructor(name:string) {
      this.name = name;
  }
}
