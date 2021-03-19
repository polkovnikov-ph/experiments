export interface Grammar {
    type: 'Grammar';
    rules: Rule[];
}
export type Rule = Union | Sequence
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
    field: Maybe<Field>;
    stringy: Maybe<string>;
    term: Term;
    suffix: Maybe<Suffix>;
}
export interface Field {
    type: 'Field';
    name: Ident;
}
export interface Suffix {
    type: 'Suffix';
    suffix: string;
}
export type Term = Ref | Klass | String1 | String2
export interface Ref {
    type: 'Ref';
    name: Ident;
}
export interface Klass {
    type: 'Klass';
    inverted: Maybe<Inverted>;
    parts: ClassPart[];
}
export interface Inverted {
    type: 'Inverted';
}
export type ClassPart = Range | Single
export interface Range {
    type: 'Range';
    from: ClassChar;
    to: ClassChar;
}
export interface Single {
    type: 'Single';
    char: ClassChar;
}
export type ClassChar = ClassCharEscape | ClassCharSimple
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
export type String1Char = String1CharEscape | String1CharSimple
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
export type String2Char = String2CharEscape | String2CharSimple
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