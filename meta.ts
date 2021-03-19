import { Apply, TypeTag } from "./ft";
import { Maybe } from "./lodash";
export { Apply, TypeTag } from './ft';

export const memo = <T extends object, R>(f: (arg: T) => R) => {
    const results = new Map<T, R>();
    return (arg: T): R => results.get(arg) || (() => {
        const value = f(arg);
        results.set(arg, value);
        return value;
    })();
};

export interface Type<T> {
    string: T;
    number: T;
    array: (type: T) => T;
    maybe: (type: T) => T;
    ref: (name: string) => T;
}
export interface Iface<T, I> {
    iface: (name: string, fields: Record<string, T>) => I;
}
export interface Union<T, I> {
    union: (name: string, options: T[]) => I;
}

// export interface Type<TypeDef_, Type_> {
//     number: Type_;
//     string: Type_;
//     array: (child: Type_) => Type_;
//     ref: (name: string, typeDef: () => TypeDef_) => Type_;
// }
// export interface Cons<Type_, Cons_> {
//     nil: Cons_;
//     field: (left: Cons_, name: string, right: Type_) => Cons_;
// }
// export interface TypeDef<Cons_, TypeDef_> {
//     typeDef: (name: string, child: Record<string, Cons_>) => TypeDef_;
// }
// export type TypeMeta<Type_, Cons_, TypeDef_> = TypeDef<Cons_, TypeDef_> & Cons<Type_, Cons_> & Type<TypeDef_, Type_>

export interface Type1<TypeDef_ extends TypeTag, Type_ extends TypeTag> {
    number: Apply<Type_, number>;
    string: Apply<Type_, string>;
    array: <T>(
        child: Apply<Type_, T>,
    ) => Apply<Type_, T[]>;
    ref: <T>(
        name: string, 
        typeDef: () => Apply<TypeDef_, T>,
    ) => Apply<Type_, T>;
}
export interface Cons1<Type_ extends TypeTag, Cons_ extends TypeTag> {
    nil: Apply<Cons_, {}>;
    field: <T extends object, K extends string, U>(
        left: Apply<Cons_, T>, 
        name: K,
        right: Apply<Type_, U>,
    ) => Apply<Cons_, T & { [KK in K]: U }>;
}
export interface TypeDef1<Cons_ extends TypeTag, TypeDef_ extends TypeTag> {
    typeDef: <K extends string, O extends Record<string, object>>(
        name: K,
        child: { [K in keyof O]: Apply<Cons_, O[K]> }
    ) => Apply<TypeDef_, {
        [K in keyof O & string]: {type: K} & O[K]
    }[keyof O & string]>;
}
export type TypeMeta1<
    T extends TypeTag,
    C extends TypeTag,
    D extends TypeTag,
> = 
    & TypeDef1<C, D>
    & Cons1<T, C>
    & Type1<D, T>

export interface Prims1<G extends TypeTag, F extends TypeTag> {
    one: Apply<F, {}>;
    seq0: <T extends object, U>(prev: Apply<F, T>, next: Apply<F, U>) => Apply<F, T>;
    seq1: <T extends object, U, K extends string>(prev: Apply<F, T>, name: K, next: Apply<F, U>) => Apply<F, T & { [L in K]: U }>;
    zero: Apply<F, never>;
    sel: <T, U>(prev: Apply<F, T>, next: Apply<F, U>) => Apply<F, T | U>;
    call: <T>(name: string, ref: () => Apply<G, T>) => Apply<F, T>;
    many: <T>(child: Apply<F, T>) => Apply<F, T[]>;
    some: <T>(child: Apply<F, T>) => Apply<F, T[]>;
    maybe: <T>(child: Apply<F, T>) => Apply<F, Maybe<T>>;
    string: (value: string) => Apply<F, string>;
    klass: (value: string) => Apply<F, string>;
    stringy: <T>(child: Apply<F, T>) => Apply<F, string>;
}
export interface Def1<F extends TypeTag, G extends TypeTag> {
    tagged: <T, K extends string>(name: K, prims: Apply<F, T>) => Apply<G, { type: K } & T>;
    untagged: <T>(name: string, prims: Apply<F, T>) => Apply<G, T>;
}
export type Grammar1<F extends TypeTag, G extends TypeTag> = Prims1<G, F> & Def1<F, G>