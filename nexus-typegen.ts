/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */







declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  LoginInput: { // input type
    email: string; // String!
    password: string; // String!
    rememberMe?: boolean | null; // Boolean
  }
  UserInput: { // input type
    birthDate: string; // String!
    email: string; // String!
    name: string; // String!
    password: string; // String!
  }
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  Mutation: {};
  Query: {};
  UserResponse: { // root type
    birthDate: string; // String!
    email: string; // String!
    id: number; // Int!
    name: string; // String!
  }
  login: { // root type
    token?: string | null; // String
    user?: NexusGenRootTypes['UserResponse'] | null; // UserResponse
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  Mutation: { // field return type
    createUser: NexusGenRootTypes['UserResponse']; // UserResponse!
    login: NexusGenRootTypes['login']; // login!
  }
  Query: { // field return type
    hello: string; // String!
    user: NexusGenRootTypes['UserResponse']; // UserResponse!
  }
  UserResponse: { // field return type
    birthDate: string; // String!
    email: string; // String!
    id: number; // Int!
    name: string; // String!
  }
  login: { // field return type
    token: string | null; // String
    user: NexusGenRootTypes['UserResponse'] | null; // UserResponse
  }
}

export interface NexusGenFieldTypeNames {
  Mutation: { // field return type name
    createUser: 'UserResponse'
    login: 'login'
  }
  Query: { // field return type name
    hello: 'String'
    user: 'UserResponse'
  }
  UserResponse: { // field return type name
    birthDate: 'String'
    email: 'String'
    id: 'Int'
    name: 'String'
  }
  login: { // field return type name
    token: 'String'
    user: 'UserResponse'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createUser: { // args
      user: NexusGenInputs['UserInput']; // UserInput!
    }
    login: { // args
      data: NexusGenInputs['LoginInput']; // LoginInput!
    }
  }
  Query: {
    user: { // args
      id: number; // Int!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}