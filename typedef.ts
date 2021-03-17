import * as m from './meta';
export interface Ref {
    kind: 'ref';
    name: string;
}
export interface String {
    kind: 'string';
}
export interface Array {
    kind: 'array';
    type: Type;
}
export type Type = Ref | String | Array;
export interface Field {
    kind: 'field';
    name: string;
    type: Type;
}
export interface Cons {
    kind: 'cons';
    name: string;
    fields: Field[];
}
export interface TypeDef {
    kind: 'typeDef';
    name: string;
    options: Cons[];
}
export const ref = (name: string): Ref => ({
    kind: 'ref',
    name,
});
export const string = (): String => ({
    kind: 'string',
});
export const array = (type: Type): Array => ({
    kind: 'array',
    type,
});
export const field = (name: string, type: Type): Field => ({
    kind: 'field',
    name,
    type,
});
export const cons = (name: string, fields: Field[]): Cons => ({
    kind: 'cons',
    name,
    fields,
});
export const typeDef = (name: string, options: Cons[]): TypeDef => ({
    kind: 'typeDef',
    name,
    options,
});
export const Type = m.memo(
    <T, F, C, D>(f: m.TypeMeta<T, F, C, D>): D =>
        f.typeDef('Type', [
            f.cons('Ref', [f.field('name', f.string)]),
            f.cons('String', []),
            f.cons('Array', [f.field('type', f.ref('Type', () => Type(f)))]),
        ]),
);
export const Field = m.memo(
    <T, F, C, D>(f: m.TypeMeta<T, F, C, D>): D =>
        f.typeDef('Field', [
            f.cons('Field', [
                f.field('name', f.string),
                f.field('type', f.ref('Type', () => Type(f))),
            ]),
        ]),
);
export const Cons = m.memo(
    <T, F, C, D>(f: m.TypeMeta<T, F, C, D>): D =>
        f.typeDef('Cons', [
            f.cons('Cons', [
                f.field('name', f.string),
                f.field('fields', f.array(f.ref('Field', () => Field(f)))),
            ]),
        ]),
);
export const TypeDef = m.memo(
    <T, F, C, D>(f: m.TypeMeta<T, F, C, D>): D =>
        f.typeDef('TypeDef', [
            f.cons('TypeDef', [
                f.field('name', f.string),
                f.field('options', f.array(f.ref('Cons', () => Cons(f)))),
            ]),
        ]),
);

