export type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

export const singleton = <K extends string, V>(key: K, value: V) => {
    return { [key]: value } as { [L in K]: V };
};

export const keysOf = <O extends {}>(o: O) => Object.keys(o) as Extract<keyof O, string>[];

export type EnumKeys<Enum> = Exclude<keyof Enum, number>

export const enumObject = <Enum extends Record<string, number | string>>(e: Enum) => {
    const copy = {...e} as { [K in EnumKeys<Enum>]: Enum[K] };
    Object.values(e).forEach(value => typeof value === 'number' && delete copy[value]);
    return copy;
};

export const enumKeys = <Enum extends Record<string, number | string>>(e: Enum) => {
    return Object.keys(enumObject(e)) as EnumKeys<Enum>[];
};

export const enumValues = <Enum extends Record<string, number | string>>(e: Enum) => {
    return [...new Set(Object.values(enumObject(e)))] as Enum[EnumKeys<Enum>][];
};

export const flatMap = <A, B>(xs: A[], f: (x: A) => B[]): B[] => {
    return flatten(xs.map(f));
};

export const flatten = <A,>(xss: A[][]): A[] => {
    const empty: A[] = [];
    return empty.concat(...xss);
};

// utilities to avoid using type name strings (as returned from `typeof`) all over the code
// they're not compressed by either of minifiers
export const enum TypeName {
    Null,
    Boolean,
    Number,
    String,
    Array,
    Object,
    Undefined,
}

const MapTypeToTypeOf = {
    [TypeName.Null]: 'object',
    [TypeName.Boolean]: 'boolean',
    [TypeName.Number]: 'number',
    [TypeName.String]: 'string',
    [TypeName.Array]: 'object',
    [TypeName.Object]: 'object',
    [TypeName.Undefined]: 'undefined',
} as const;

export const typeNameToString = <K extends TypeName>(type: K): (typeof MapTypeToTypeOf)[K] => MapTypeToTypeOf[type];

export type TypeFromName = {
    [TypeName.Null]: null,
    [TypeName.Boolean]: boolean,
    [TypeName.Number]: number,
    [TypeName.String]: string,
    [TypeName.Array]: unknown[],
    [TypeName.Object]: Record<string, unknown>,
    [TypeName.Undefined]: undefined,
}

export const checkType = <K extends TypeName>(value: TypeFromName[TypeName], type: K): value is TypeFromName[K] => {
    const realType = typeof value;
    return realType !== 'object'
        ? realType === typeNameToString(type)
        : Array.isArray(value)
        ? type === TypeName.Array
        : value === null
        ? type === TypeName.Null
        : type === TypeName.Object
};

export type NonReferenceType = null | boolean | number | string