import * as m from './grammar-runtime';
import * as f from './ft';
import * as l from './lodash';
export interface Grammar {
    type: 'Grammar';
    rules: Rule[];
}
export type Rule = Union | Sequence;
export interface Union {
    type: 'Union';
    name: Ident;
    cases: Ident[];
}
export interface Sequence {
    type: 'Sequence';
    name: Ident;
    terms: Part[];
}
export interface Part {
    type: 'Part';
    field: l.Maybe<Field>;
    stringy: l.Maybe<string>;
    term: Term;
    suffix: l.Maybe<Suffix>;
}
export interface Field {
    type: 'Field';
    name: Ident;
}
export interface Suffix {
    type: 'Suffix';
    suffix: string;
}
export type Term = Ref | Klass | String1 | String2;
export interface Ref {
    type: 'Ref';
    name: Ident;
}
export interface Klass {
    type: 'Klass';
    inverted: l.Maybe<Inverted>;
    parts: ClassPart[];
}
export interface Inverted {
    type: 'Inverted';
}
export type ClassPart = Range | Single;
export interface Range {
    type: 'Range';
    from: ClassChar;
    to: ClassChar;
}
export interface Single {
    type: 'Single';
    char: ClassChar;
}
export type ClassChar = ClassCharEscape | ClassCharSimple;
export interface ClassCharSimple {
    type: 'ClassCharSimple';
    char: string;
}
export interface ClassCharEscape {
    type: 'ClassCharEscape';
    char: string;
}
export interface String1 {
    type: 'String1';
    chars: String1Char[];
}
export type String1Char = String1CharEscape | String1CharSimple;
export interface String1CharSimple {
    type: 'String1CharSimple';
    char: string;
}
export interface String1CharEscape {
    type: 'String1CharEscape';
    char: string;
}
export interface String2 {
    type: 'String2';
    chars: String2Char[];
}
export type String2Char = String2CharEscape | String2CharSimple;
export interface String2CharSimple {
    type: 'String2CharSimple';
    char: string;
}
export interface String2CharEscape {
    type: 'String2CharEscape';
    char: string;
}
export interface Ident {
    type: 'Ident';
    name: string;
}
export interface IdentName {
    type: 'IdentName';
}
export interface _ {
    type: '_';
}
export const Grammar = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Grammar> =>
        f.tagged(
            'Grammar',
            f.seq1(
                f.seq0(
                    f.one,
                    f.call('_', () => _(f)),
                ),
                'rules',
                f.many(f.call('Rule', () => Rule(f))),
            ),
        ),
);
export const Rule = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Rule> =>
        f.untagged(
            'Rule',
            f.sel(
                f.sel(
                    f.zero,
                    f.call('Union', () => Union(f)),
                ),
                f.call('Sequence', () => Sequence(f)),
            ),
        ),
);
export const Union = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Union> =>
        f.tagged(
            'Union',
            f.seq0(
                f.seq0(
                    f.seq1(
                        f.seq0(
                            f.seq0(
                                f.seq1(
                                    f.one,
                                    'name',
                                    f.call('Ident', () => Ident(f)),
                                ),
                                f.string(':'),
                            ),
                            f.call('_', () => _(f)),
                        ),
                        'cases',
                        f.many(f.call('Ident', () => Ident(f))),
                    ),
                    f.string(';'),
                ),
                f.call('_', () => _(f)),
            ),
        ),
);
export const Sequence = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Sequence> =>
        f.tagged(
            'Sequence',
            f.seq0(
                f.seq0(
                    f.seq1(
                        f.seq0(
                            f.seq0(
                                f.seq1(
                                    f.one,
                                    'name',
                                    f.call('Ident', () => Ident(f)),
                                ),
                                f.string('='),
                            ),
                            f.call('_', () => _(f)),
                        ),
                        'terms',
                        f.many(f.call('Part', () => Part(f))),
                    ),
                    f.string(';'),
                ),
                f.call('_', () => _(f)),
            ),
        ),
);
export const Part = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Part> =>
        f.tagged(
            'Part',
            f.seq1(
                f.seq1(
                    f.seq1(
                        f.seq1(
                            f.one,
                            'field',
                            f.maybe(f.call('Field', () => Field(f))),
                        ),
                        'stringy',
                        f.maybe(f.string('$')),
                    ),
                    'term',
                    f.call('Term', () => Term(f)),
                ),
                'suffix',
                f.maybe(f.call('Suffix', () => Suffix(f))),
            ),
        ),
);
export const Field = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Field> =>
        f.tagged(
            'Field',
            f.seq0(
                f.seq1(
                    f.one,
                    'name',
                    f.call('Ident', () => Ident(f)),
                ),
                f.string(':'),
            ),
        ),
);
export const Suffix = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Suffix> =>
        f.tagged(
            'Suffix',
            f.seq0(
                f.seq1(f.one, 'suffix', f.klass('+*?')),
                f.call('_', () => _(f)),
            ),
        ),
);
export const Term = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Term> =>
        f.untagged(
            'Term',
            f.sel(
                f.sel(
                    f.sel(
                        f.sel(
                            f.zero,
                            f.call('Ref', () => Ref(f)),
                        ),
                        f.call('Klass', () => Klass(f)),
                    ),
                    f.call('String1', () => String1(f)),
                ),
                f.call('String2', () => String2(f)),
            ),
        ),
);
export const Ref = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Ref> =>
        f.tagged(
            'Ref',
            f.seq1(
                f.one,
                'name',
                f.call('Ident', () => Ident(f)),
            ),
        ),
);
export const Klass = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Klass> =>
        f.tagged(
            'Klass',
            f.seq0(
                f.seq0(
                    f.seq1(
                        f.seq1(
                            f.seq0(f.one, f.string('[')),
                            'inverted',
                            f.maybe(f.call('Inverted', () => Inverted(f))),
                        ),
                        'parts',
                        f.some(f.call('ClassPart', () => ClassPart(f))),
                    ),
                    f.string(']'),
                ),
                f.call('_', () => _(f)),
            ),
        ),
);
export const Inverted = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Inverted> =>
        f.tagged('Inverted', f.seq0(f.one, f.string('^'))),
);
export const ClassPart = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, ClassPart> =>
        f.untagged(
            'ClassPart',
            f.sel(
                f.sel(
                    f.zero,
                    f.call('Range', () => Range(f)),
                ),
                f.call('Single', () => Single(f)),
            ),
        ),
);
export const Range = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Range> =>
        f.tagged(
            'Range',
            f.seq1(
                f.seq0(
                    f.seq1(
                        f.one,
                        'from',
                        f.call('ClassChar', () => ClassChar(f)),
                    ),
                    f.string('-'),
                ),
                'to',
                f.call('ClassChar', () => ClassChar(f)),
            ),
        ),
);
export const Single = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Single> =>
        f.tagged(
            'Single',
            f.seq1(
                f.one,
                'char',
                f.call('ClassChar', () => ClassChar(f)),
            ),
        ),
);
export const ClassChar = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, ClassChar> =>
        f.untagged(
            'ClassChar',
            f.sel(
                f.sel(
                    f.zero,
                    f.call('ClassCharEscape', () => ClassCharEscape(f)),
                ),
                f.call('ClassCharSimple', () => ClassCharSimple(f)),
            ),
        ),
);
export const ClassCharSimple = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, ClassCharSimple> =>
        f.tagged(
            'ClassCharSimple',
            f.seq1(f.one, 'char', f.klass('^\\\\\\[\\]')),
        ),
);
export const ClassCharEscape = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, ClassCharEscape> =>
        f.tagged(
            'ClassCharEscape',
            f.seq1(
                f.seq0(f.one, f.string('\\')),
                'char',
                f.klass('\\\\\\[\\]rnt'),
            ),
        ),
);
export const String1 = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, String1> =>
        f.tagged(
            'String1',
            f.seq0(
                f.seq0(
                    f.seq1(
                        f.seq0(f.one, f.string("'")),
                        'chars',
                        f.some(f.call('String1Char', () => String1Char(f))),
                    ),
                    f.string("'"),
                ),
                f.call('_', () => _(f)),
            ),
        ),
);
export const String1Char = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, String1Char> =>
        f.untagged(
            'String1Char',
            f.sel(
                f.sel(
                    f.zero,
                    f.call('String1CharEscape', () => String1CharEscape(f)),
                ),
                f.call('String1CharSimple', () => String1CharSimple(f)),
            ),
        ),
);
export const String1CharSimple = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, String1CharSimple> =>
        f.tagged(
            'String1CharSimple',
            f.seq1(f.one, 'char', f.klass("^'\\\\\\r\\n\\t")),
        ),
);
export const String1CharEscape = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, String1CharEscape> =>
        f.tagged(
            'String1CharEscape',
            f.seq1(f.seq0(f.one, f.string('\\')), 'char', f.klass("'\\\\rnt")),
        ),
);
export const String2 = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, String2> =>
        f.tagged(
            'String2',
            f.seq0(
                f.seq0(
                    f.seq1(
                        f.seq0(f.one, f.string('"')),
                        'chars',
                        f.some(f.call('String2Char', () => String2Char(f))),
                    ),
                    f.string('"'),
                ),
                f.call('_', () => _(f)),
            ),
        ),
);
export const String2Char = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, String2Char> =>
        f.untagged(
            'String2Char',
            f.sel(
                f.sel(
                    f.zero,
                    f.call('String2CharEscape', () => String2CharEscape(f)),
                ),
                f.call('String2CharSimple', () => String2CharSimple(f)),
            ),
        ),
);
export const String2CharSimple = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, String2CharSimple> =>
        f.tagged(
            'String2CharSimple',
            f.seq1(f.one, 'char', f.klass('^"\\\\\\r\\n\\t')),
        ),
);
export const String2CharEscape = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, String2CharEscape> =>
        f.tagged(
            'String2CharEscape',
            f.seq1(f.seq0(f.one, f.string('\\')), 'char', f.klass('"\\\\rnt')),
        ),
);
export const Ident = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, Ident> =>
        f.tagged(
            'Ident',
            f.seq0(
                f.seq1(
                    f.one,
                    'name',
                    f.stringy(f.call('IdentName', () => IdentName(f))),
                ),
                f.call('_', () => _(f)),
            ),
        ),
);
export const IdentName = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, IdentName> =>
        f.tagged(
            'IdentName',
            f.seq0(
                f.seq0(f.one, f.klass('a-zA-Z_')),
                f.some(f.klass('a-zA-Z0-9_')),
            ),
        ),
);
export const _ = l.memo(
    <T extends f.TypeTag, G extends f.TypeTag>(
        f: m.Grammar1<T, G>,
    ): f.Apply<G, _> =>
        f.tagged('_', f.seq0(f.one, f.some(f.klass(' \\t\\r\\n')))),
);

