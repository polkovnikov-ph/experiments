import * as m from './meta';
export interface Bar {
    type: 'Bar';
    bar: string;
}
export interface Baz {
    type: 'Baz';
    baz: number;
}
export type Foo = Bar | Baz;
export const bar = (bar: string): Bar => ({
    type: 'Bar',
    bar,
});
export const baz = (baz: number): Baz => ({
    type: 'Baz',
    baz,
});
export const Foo = m.memo(
    <T extends m.TypeTag, C extends m.TypeTag, D extends m.TypeTag>(
        f: m.TypeMeta1<T, C, D>,
    ): m.Apply<D, Foo> =>
        f.typeDef('Foo', {
            Bar: f.field(f.nil, 'bar', f.string),
            Baz: f.field(f.nil, 'baz', f.number),
        }),
);

