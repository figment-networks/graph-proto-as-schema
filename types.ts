import * as graphql from "graphql";

export class DocumentNode {
    public kind: "Document";
    public definitions: Array<graphql.TypeDefinitionNode>;

    constructor(definition: Array<graphql.TypeDefinitionNode>) {
      this.kind = "Document";
      this.definitions = definition;
    }
  }

  export class NameNode {
    public kind: "Name";
    public value: string;

    constructor(value: string) {
      this.kind = "Name";
      this.value = value;
    }
  }

  export class ObjectTypeDefinitionNode {
    kind: "ObjectTypeDefinition";
    description?: StringValueNode;
    name: NameNode;
    //    interfaces?: ReadonlyArray<NamedTypeNode>;
    directives: Array<DirectiveNode>;
    fields: Array<graphql.FieldDefinitionNode>;

    constructor(name: NameNode) {
      this.kind = "ObjectTypeDefinition";
      this.name = name;
      this.fields = [];
      this.directives = [];
    }
  }

  export class DirectiveNode {
    readonly kind: "Directive";
    readonly name: NameNode;
    // readonly arguments?: ReadonlyArray<ArgumentNode>;

    constructor(name: NameNode) {
      this.kind = "Directive";
      this.name = name;
    }
  }

  export class StringValueNode {
    public kind: "StringValue";
    public value: string;
    public block?: boolean;

    constructor(value: string, block?: boolean) {
      this.kind = "StringValue";
      this.value = value;
      this.block = block;
    }
  }

  export class EnumTypeDefinitionNode {
    kind: "EnumTypeDefinition";
    description?: StringValueNode;
    name: NameNode;
    directives?: Array<DirectiveNode>;
    values: Array<EnumValueDefinitionNode>;

    constructor(name: NameNode) {
      this.kind = "EnumTypeDefinition";
      this.name = name;
      this.values = new Array<EnumValueDefinitionNode>();
    }
  }

  export class EnumValueDefinitionNode {
    kind: "EnumValueDefinition";
    description?: StringValueNode;
    name: NameNode;
    directives?: Array<DirectiveNode>;

    constructor(name: NameNode) {
      this.kind = "EnumValueDefinition";
      this.name = name;
    }
  }

  export class FieldDefinitionNode {
    kind: "FieldDefinition";
    description?: StringValueNode;
    name: NameNode;
    // arguments?: ReadonlyArray<InputValueDefinitionNode>;
    type: graphql.TypeNode;
    // directives?: ReadonlyArray<DirectiveNode>;
    constructor(name: NameNode, type: graphql.TypeNode) {
      this.kind = "FieldDefinition";
      this.name = name;
      this.type = type;
    }
  }

  export class NamedTypeNode {
    public kind: "NamedType";
    public name: NameNode;

    constructor(name: NameNode) {
      this.kind = "NamedType";
      this.name = name;
    }
  }

  export class ListTypeNode {
    public kind: "ListType";
    public type: graphql.TypeNode;

    constructor(type: graphql.TypeNode) {
      this.kind = "ListType";
      this.type = type;
    }
  }

  export class NonNullTypeNode {
    public kind: "NonNullType";
    public type: NamedTypeNode | ListTypeNode;

    constructor(type: NamedTypeNode | ListTypeNode) {
      this.kind = "NonNullType";
      this.type = type;
    }
  }
