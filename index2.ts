import { TypeDef } from './typedef';
import { jsonWriter } from './typedef-json';
import * as x from './typedef';
import {inspect} from 'util';

const value = x.typeDef('Foo', [
    x.cons('Bar', [
        x.field('bar', x.string()),
    ]),
    x.cons('Baz', [
        x.field('baz', x.string()),
    ]),
])
console.log(inspect(value, {
    depth: null,
    colors: true,
}));
const result = TypeDef(jsonWriter)(value);
console.log(inspect(result, {
    depth: null,
    colors: true,
}));