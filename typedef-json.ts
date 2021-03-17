import { Json, toProperCase } from './lodash';
import * as m from './meta';

type T = (value: any) => Json
export const jsonWriter: m.TypeMeta<T, [string, T], [string, T], T> = ({
    ref: (_name, typeDef) => value => {
        return typeDef()(value);
    },
    array: (type) => value => {
        return (value as unknown as any[]).map(v => type(v));
    },
    string: value => {
        return value as any;
    },
    field: (name, type) => [name, value => type(value)],
    cons: (name, fields) => [name, value => {
        const result: Record<string, Json> = {
            kind: toProperCase(name),
        };
        for (const [name, child] of fields) {
            result[name] = child((value as any)[name]);
        }
        return result;
    }],
    typeDef: (_name, options) => value => {
        const opts = Object.fromEntries(options.map(([a, b]: any) => (
            [toProperCase(a), b]
        )));
        return opts[(value as any)["kind"]](value);
    },
});