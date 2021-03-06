import { Apply, TypeTag } from "./ft";
import { Maybe } from "./lodash";

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