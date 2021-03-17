import { Apply, TypeTag } from "./ft";

export interface TypeDef<C, D> {
    typeDef: (name: string, options: C[]) => D;
}
export interface Cons<F, C> {
    cons: (name: string, fields: F[]) => C;
}
export interface Field<T, F> {
    field: (name: string, type: T) => F;
}
export interface Type<D, T> {
    ref: (name: string, typeDef: () => D) => T;
    string: T;
    array: (type: T) => T;
}
export type TypeMeta<T, F, C, D> =
    & TypeDef<C, D>
    & Cons<F, C>
    & Field<T, F>
    & Type<D, T>
export const memo = <T extends object, R>(f: (arg: T) => R) => {
    const results = new Map<T, R>();
    return (arg: T): R => results.get(arg) || (() => {
        const value = f(arg);
        results.set(arg, value);
        return value;
    })();
};

export interface Type1<Type_ extends TypeTag> {
    number: Apply<Type_, number>;
    string: Apply<Type_, string>;
    array: <T>(child: Apply<Type_, T>) => Apply<Type_, T[]>;
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
    | TypeDef1<C, D>
    | Cons1<T, C>
    | Type1<T>