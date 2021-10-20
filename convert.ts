import {
  ObjectTypeDefinitionNode,
  NameNode,
  StringValueNode,
  DirectiveNode,
  FieldDefinitionNode,
  NonNullTypeNode,
  NamedTypeNode,
  ListTypeNode,
  EnumTypeDefinitionNode,
  DocumentNode,
  EnumValueDefinitionNode,
} from "./types";
import * as t from "proto-parser";
import * as graphql from "graphql";

export function toSchemaObjects(
  protoDocument: t.ProtoDocument,
  forceNonNullLists: boolean
): graphql.DocumentNode {
  let arr = new Array();
  const mainNamespace = stripNamespace(protoDocument.root);
  const nested = mainNamespace?.nested;
  for (const key in nested) {
    if (Object.prototype.hasOwnProperty.call(nested, key)) {
      const el = nested[key];
      if (el.syntaxType === t.SyntaxType.MessageDefinition) {
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
      } else if (el.syntaxType === t.SyntaxType.EnumDefinition) {
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
      }
    }
  }
  return new DocumentNode(arr) as graphql.DocumentNode;
}

export function stripNamespace(
  protoRoot: t.ProtoRoot | t.NamespaceBase
): t.NamespaceBase | null {
  if (protoRoot.nested !== undefined) {
    for (const key in protoRoot.nested) {
      if (Object.prototype.hasOwnProperty.call(protoRoot.nested, key)) {
        const el = protoRoot.nested[key];
        if (el.syntaxType == t.SyntaxType.NamespaceDefinition) {
          return stripNamespace(el);
        }
      } else {
        return protoRoot;
      }
    }
  }

  return protoRoot;
}
