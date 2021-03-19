import { readFileSync } from 'fs'
import * as t from '@babel/types';
import generate from '@babel/generator';
import {format} from 'prettier';
import { parse } from './grammar';
import * as g from './grammar-ast';
import { isTruthy, toImproperCase } from './lodash';
import { Iface, Type, Union } from './meta';
import { codegenType } from './codegen-type';
import * as gn from './grammar-new';
import { interpret } from './grammar-interp';

// TODO:
//  - отдебажить, почему парсер не пашет
//  - удалить pegjs
//  - генерировать ft вместо adt в грамматиках, сделать compile*/type* алгебрами
//  - генерировать Prims/Grammar/Prims1/Grammar1, Type/Iface/Union/Type1/Iface1/Union1

// (тип) => (терм этого типа) => бабельный аст

interface Prims<T> {
    one: T;
    seq0: (prev: T, next: T) => T;
    seq1: (prev: T, name: string, next: T) => T;
    zero: T;
    sel: (prev: T, next: T) => T;
    call: (name: string) => T;
    many: (child: T) => T;
    some: (child: T) => T;
    maybe: (child: T) => T;
    string: (value: string) => T;
    klass: (value: string) => T;
    stringy: (child: T) => T;
}
interface Grammar<T, G> {
    tagged: (name: string, prims: T) => G;
    untagged: (name: string, prims: T) => G;
}
type TP = <T>(alg: Prims<T>) => T;
type TG = <T, G>(alg: Prims<T> & Grammar<T, G>) => G;

const CharMap: Record<string, string> = {
    'r': '\r',
    'n': '\n',
    't': '\t',
    '\\': '\\',
    '"': '"',
    "'": "'",
};
const charCompiler = <K extends string>(k: K) => (node: {type: string, char: string}) => {
    if (node.type === k) {
        return node.char;
    } else {
        return CharMap[node.char];
    }
};
const compileClassChar = (node: g.ClassChar) => {
    if (node.type === 'ClassCharSimple') {
        return node.char;
    } else {
        return '\\' + node.char;
    }
};
const compileString1Char = charCompiler('String1CharSimple');
const compileString2Char = charCompiler('String2CharSimple');

const compileRef = (node: g.Ref): TP => {
    return t => t.call(toImproperCase(node.name.name));
};

const compileKlass = (node: g.Klass): TP => {
    const value = (node.inverted ? '^' : '') + node.parts.map(part => {
        if (part.type === 'Single') {
            return compileClassChar(part.char);
        } else {
            return `${compileClassChar(part.from)}-${compileClassChar(part.to)}`;
        }
    }).join('');
    return t => t.klass(value);
};

const compileString1 = (node: g.String1): TP => {
    const text = node.chars.map(compileString1Char).join('');
    return t => t.string(text);
};

const compileString2 = (node: g.String2): TP => {
    const text = node.chars.map(compileString2Char).join('');
    return t => t.string(text);
};

const compileTerm = (node: g.Term): TP => {
    switch (node.type) {
        case 'Ref': return compileRef(node);
        case 'Klass': return compileKlass(node);
        case 'String1': return compileString1(node);
        case 'String2': return compileString2(node);
    }
};

const compilePart = (node: g.Part) => {
    const name = node.field ? node.field.name.name : undefined;
    let result: TP = t => compileTerm(node.term)(t);
    if (node.suffix) {
        switch (node.suffix.suffix) {
            case '+': result = ((r: TP): TP => t => t.many(r(t)))(result); break;
            case '*': result = ((r: TP): TP => t => t.some(r(t)))(result); break;
            case '?': result = ((r: TP): TP => t => t.maybe(r(t)))(result); break;
            default: throw new Error("Impossible");
        }
    }
    if (node.stringy) {
        result = ((r: TP): TP => t => t.stringy(r(t)))(result);
    }
    return <T>(t: Prims<T>) => [name, result(t)] as const;
};

const compileSequence = (node: g.Sequence): TG => t => {
    const prims1 = node.terms
        .map(term => compilePart(term)(t))
    const prims = prims1.reduce(
        (acc, [name, term]) => name
            ? t.seq1(acc, name, term)
            : t.seq0(acc, term),
        t.one,
    );
    return t.tagged(node.name.name, prims);
};

const compileUnion = (node: g.Union): TG => t => {
    const cs = node.cases
        .map(name => t.call(toImproperCase(name.name)))
        .reduce((acc, term) => t.sel(acc, term), t.zero);
    return t.untagged(node.name.name, cs);
};

const compileRule = (node: g.Rule): TG => {
    switch (node.type) {
        case 'Sequence': return compileSequence(node);
        case 'Union': return compileUnion(node);
    }
};

const compileGrammar = (node: g.Grammar): TG[] => {
    return node.rules.map(compileRule);
};

type FT = <T>(alg: Type<T>) => T;
type FI = <T, I>(alg: Type<T> & Iface<T, I> & Union<T, I>) => I;

const typeTerm = (node: g.Term): FT => {
    switch (node.type) {
        case 'Ref':
            return t => t.ref(toImproperCase(node.name.name));
        case 'Klass': 
        case 'String1': 
        case 'String2':
            return t => t.string;
    }
};

const typePart = (node: g.Part) => {
    if (!node.field) {
        return undefined;
    }
    const name = node.field.name.name;
    let type = typeTerm(node.term);
    if (node.suffix) {
        switch (node.suffix.suffix) {
            case '+':
            case '*':
                type = ((type: FT): FT => t => t.array(type(t)))(type);
                break;
            case '?':
                type = ((type: FT): FT => t => t.maybe(type(t)))(type);
                break;
            default: throw new Error("Impossible");
        }
    }
    if (node.stringy) {
        type = t => t.string;
    }
    return [name, type] as const;
};

const typeSequence = (node: g.Sequence): FI => t => t.iface(
    toImproperCase(node.name.name),
    Object.fromEntries(
        node.terms.map(typePart)
            .filter(isTruthy)
            .map(([name, type]) => [name, type(t)] as const),
    ),
);

const typeUnion = (node: g.Union): FI => t => (
    t.union(
        toImproperCase(node.name.name),
        node.cases.map(c => t.ref(toImproperCase(c.name))),
    )
);

const typeRule = (node: g.Rule): FI => {
    switch (node.type) {
        case 'Sequence': return typeSequence(node);
        case 'Union': return typeUnion(node);
    }
};

const typeGrammar = (node: g.Grammar): FI[] => {
    return node.rules.map(typeRule);
};


const algebraName = "f";
const prim = (name: string, ...args: t.Expression[]): t.Expression => {
    const field = t.memberExpression(
        t.identifier(algebraName),
        t.identifier(name),
    );
    return args.length > 0
        ? t.callExpression(field, args)
        : field;
};
const def = (callName: string) => (name: string, prims: t.Expression): t.Declaration => {
    const typeParams = ["T", "G"];
    const ref = t.tsTypeReference(
        t.tsQualifiedName(t.identifier("m"), t.identifier("Grammar1"))
    );
    ref.typeParameters = t.tsTypeParameterInstantiation(
        typeParams.map(name => (
            t.tsTypeReference(t.identifier(name))
        )),
    );
    const param = t.identifier(algebraName);
    param.typeAnnotation = t.tsTypeAnnotation(ref);
    const func = t.arrowFunctionExpression(
        [param], 
        prim(callName, t.stringLiteral(toImproperCase(name)), prims),
    );
    func.typeParameters = t.tSTypeParameterDeclaration(
        typeParams.map(name => (
            t.tsTypeParameter(t.tsTypeReference(
                t.tsQualifiedName(
                    t.identifier('m'),
                    t.identifier('TypeTag'),
                )
            ), null, name)
        )),
    );
    func.returnType = t.tsTypeAnnotation(
        t.tsTypeReference(
            t.tsQualifiedName(
                t.identifier("m"),
                t.identifier("Apply"),
            ),
            t.tsTypeParameterInstantiation([
                t.tsTypeReference(t.identifier('G')),
                t.tsTypeReference(t.identifier(toImproperCase(name))),
            ])
        ),
    );
    return t.exportNamedDeclaration(t.variableDeclaration(
        'const',
        [t.variableDeclarator(
            t.identifier(toImproperCase(name)),
            t.callExpression(
                t.memberExpression(
                    t.identifier("m"),
                    t.identifier("memo")
                ),
                [func],
            ),
        )],
    ));
};
const handler: Prims<t.Expression> & Grammar<t.Expression, t.Declaration> = {
    tagged: def('tagged'),
    untagged: def('untagged'),
    call: (name) => prim(
        'call', 
        t.stringLiteral(name), 
        t.arrowFunctionExpression([], t.callExpression(
            t.identifier(name),
            [t.identifier(algebraName)],
        )),
    ),
    klass: (value) => prim('klass', t.stringLiteral(value)),
    many: (child) => prim('many', child),
    maybe: (child) => prim('maybe', child),
    one: prim('one'),
    sel: (prev, next) => prim('sel', prev, next),
    seq0: (prev, next) => prim('seq0', prev, next),
    seq1: (prev, name, next) => prim('seq1', prev, t.stringLiteral(name), next),
    some: (child) => prim('some', child),
    string: (value) => prim('string', t.stringLiteral(value)),
    stringy: (child) => prim('stringy', child),
    zero: prim('zero'),
};

// const x = interpret(gn.Klass, `[^\\\\\\[\\]]`);

const code = readFileSync('grammar.pegts', 'utf-8');
// const ast = parse(code) as g.Grammar;
const ast = interpret(gn.Grammar, code);

const defs: t.Declaration[] = [
    t.importDeclaration(
        [t.importNamespaceSpecifier(t.identifier("m"))],
        t.stringLiteral('./meta'),
    ),
    t.importDeclaration(
        [t.importSpecifier(t.identifier("Maybe"), t.identifier("Maybe"))],
        t.stringLiteral('./lodash'),
    ),
    ...typeGrammar(ast).map(node => node(codegenType)),
    ...compileGrammar(ast).map(node => node(handler)),
];
const ugly = generate(t.file(t.program(defs)), {}).code;
const pretty = format(ugly, {
    parser: "babel-ts",
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: false,
    tabWidth: 4,
});
console.log(pretty);