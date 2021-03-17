import * as t from '@babel/types';
import generate from '@babel/generator';
import {format} from 'prettier';
import {flatten, isTruthy, toProperCase} from './lodash';
import * as m from './meta';
import * as test from './typedef1';

const types = <T, F, C, D>(f: m.TypeMeta<T, F, C, D>): D[] => [
    test.Type(f),
    test.Field(f),
    test.Cons(f),
    test.TypeDef(f),
];

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
    
const toMeta : m.TypeMeta<
    t.Expression, 
    t.Expression, 
    t.Expression, 
    t.Declaration
> = {
    ref: (name: string): t.Expression => {
        return prim(
            "ref", 
            t.stringLiteral(name), 
            t.callExpression(
                t.identifier(name),
                [t.identifier(algebraName)],
            ),
        );
    },
    array: (child: t.Expression): t.Expression => {
        return prim("array", child);
    },
    string: prim("string"),
    field: (name: string, type: t.Expression): t.Expression => {
        return prim("field", t.stringLiteral(name), type);
    },
    cons: (name: string, fields: t.Expression[]): t.Expression => {
        return prim("cons", t.stringLiteral(name), t.arrayExpression(fields));
    },
    typeDef: (name: string, options: t.Expression[]): t.Declaration => {
        const ref = t.tsTypeReference(
            t.tsQualifiedName(t.identifier("m"), t.identifier("TypeMeta"))
        );
        ref.typeParameters = t.tsTypeParameterInstantiation(
            ["T", "F", "C", "D"].map(name => (
                t.tsTypeReference(t.identifier(name))
            )),
        );
        const param = t.identifier(algebraName);
        param.typeAnnotation = t.tsTypeAnnotation(ref);
        const func = t.arrowFunctionExpression(
            [param],
            prim(
                "typeDef",
                t.stringLiteral(name),
                t.arrayExpression(options),
            ),
        );
        func.typeParameters = t.tSTypeParameterDeclaration(
            ["T", "F", "C", "D"].map(name => (
                t.tsTypeParameter(null, null, name)
            )),
        );
        func.returnType = t.tsTypeAnnotation(
            t.tsTypeReference(t.identifier("D")),
        );
        return t.exportNamedDeclaration(t.variableDeclaration(
            'const',
            [t.variableDeclarator(
                t.identifier(name),
                t.callExpression(
                    t.memberExpression(
                        t.identifier("m"),
                        t.identifier("memo")
                    ),
                    [func],
                ),
            )],
        ));
    },
};

const toBabelAst: m.Type<t.Declaration[], t.TSType> = {
    ref: (name: string): t.TSType => {
        return t.tsTypeReference(t.identifier(name));
    },
    array: (child: t.TSType): t.TSType => {
        return t.tsArrayType(child);
    },
    string: t.tsStringKeyword(),
};

const toTypes = (tagName: string)
    : m.TypeDef<[string, t.Declaration], t.Declaration[]>
    & m.Cons<t.TSTypeElement, [string, t.Declaration]>
    & m.Field<t.TSType, t.TSTypeElement> => ({
    field: (name: string, type: t.TSType): t.TSTypeElement => {
        return t.tsPropertySignature(
            t.identifier(name),
            t.tsTypeAnnotation(type),
        );
    },
    cons: (name: string, fields: t.TSTypeElement[]): [string, t.Declaration] => {
        const decl = t.exportNamedDeclaration(t.tsInterfaceDeclaration(
            t.identifier(name),
            null,
            null,
            t.tsInterfaceBody([
                t.tsPropertySignature(
                    t.identifier(tagName),
                    t.tsTypeAnnotation(t.tsLiteralType(
                        t.stringLiteral(toProperCase(name)),
                    )),
                ),
                ...fields,
            ]),
        ));
        return [name, decl];
    },
    typeDef: (name: string, options: [string, t.Declaration][]): t.Declaration[] => {
        const consNames = options.map(name => (
            t.tsTypeReference(t.identifier(name[0]))
        ));
        const consDecls = options.map(x => x[1]);
        if (options.length === 1 && options[0][0] === name) {
            return consDecls;
        }
        consDecls.push(t.exportNamedDeclaration(t.tsTypeAliasDeclaration(
            t.identifier(name),
            null,
            t.tsUnionType(consNames),
        )));
        return consDecls;
    },
});

const toConstr = (tagName: string)
    : m.TypeDef<t.Declaration, t.Declaration[]>
    & m.Cons<t.Identifier, t.Declaration>
    & m.Field<t.TSType, t.Identifier> => ({
    field: (name: string, type: t.TSType): t.Identifier => {
        const result = t.identifier(name);
        result.typeAnnotation = t.tsTypeAnnotation(type);
        return result;
    },
    cons: (name: string, fields: t.Identifier[]): t.Declaration => {
        const func = t.arrowFunctionExpression(
            fields,
            t.objectExpression([
                t.objectProperty(
                    t.identifier(tagName), 
                    t.stringLiteral(toProperCase(name)),
                ),
                ...fields.map(field => {
                    const same = t.identifier(field.name);
                    return t.objectProperty(same, same, undefined, true);
                }),
            ]),
        );
        func.returnType = t.tsTypeAnnotation(
            t.tsTypeReference(t.identifier(name)),
        );
        return t.exportNamedDeclaration(t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier(toProperCase(name)), func),
        ]));
    },
    typeDef: (name: string, options: t.Declaration[]): t.Declaration[] => {
        return options;
    },
});

const tagName = 'kind';
const defs = flatten([
    [t.importDeclaration(
        [t.importNamespaceSpecifier(t.identifier("m"))],
        t.stringLiteral('./meta'),
    )],
    ...types({...toTypes(tagName), ...toBabelAst}),
    ...types({...toConstr(tagName), ...toBabelAst}).filter(isTruthy),
    types(toMeta),
]);
const ugly = generate(t.file(t.program(defs)), {}).code;
const pretty = format(ugly, {
    parser: "babel-ts",
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: false,
    tabWidth: 4,
});
console.log(pretty);
// console.log(types(dependencies));

// this <-> ts types (babel)
// this -> generate functions that return objects: field(), ref(), ...
// this -> isField(), isRef(), ...
// this -> generate final tagless: field(), ref(), ... 
// this <-> json

// data Json
//     Null
//     Boolean boolean
//     Number number
//     String string
//     Array Array<Json>
//     Object Record<string, Json>

// export interface Visitor<Type, Field, Def, DefSet> {
//     ref: (name: string) => Type;
//     apply: (target: Type, args: Type[]) => Type;
//     field: (name: string, type: Type) => Field;
//     term: (name: string, polys: string[], fields: Field[]) => Def;
//     typeDef: (name: string, polys: string[], options: Type[]) => Def;
//     defSet: (defs: Def[]) => DefSet;
// }

// func.typeParameters = polys.length > 0
// ? t.tsTypeParameterDeclaration(
//     polys.map(name => t.tSTypeParameter(null, null, name)),
// )
// : undefined;
// poly: (name: string): t.TSType => {
//     return t.tsTypeReference(t.identifier(name));
// },

// term('DefSet', [
//     field('defs', apply('Array', [ref('Def')])),
// ]),
// term('Param', [
//     field('name', ref('String')),
//     field('type', ref('Type')),
// ]),
// term('Method', [
//     field('name', ref('String')),
//     field('params', apply('Array', [ref('Param')])),
//     field('resultType', ref('Type')),
// ]),
// term('Api', [
//     field('methods', apply('Array', [ref('Method')])),
// ]),


// interface name = !(reserved | strict | types)
// field name (in interface, in a.b, in a = {b: c}) = literally any
// function argument name = !(reserved | strict)
// variable declaration = !(reserved | strict | 'undefined')

// const dependencies: Def<string[], [string, string[]], string[]> & Field<string[], string[]> & Type<string[]> = ({
//     ref: (name: string) => [name],
//     apply: (name: string, args: string[][]) => [name, ...flatten(args)],
//     field: (name: string, type: string[]) => type,
//     term: (name: string, fields: string[][]) => [name, flatten(fields)],
//     typeDef: (name: string, options: string[][]) => [name, flatten(options)],
// });

// https://github.com/Microsoft/TypeScript/blob/master/src/compiler/types.ts#L112

const reserved = [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 
    'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 
    'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 
    'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with',
];

const strict = [
    'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield',
];

const typeNames = [
    'any', 'boolean', 'number', 'object', 'string', 'symbol', 'undefined', 'unknown', 'bigint',
];

const context = [
    'abstract', 'as', 'asserts', 'async', 'await', 'constructor', 'declare', 'get', 'infer',
    'intrinsic', 'is', 'keyof', 'module', 'namespace', 'never', 'readonly', 'require', 'set',
    'type', 'unique', 'from', 'global', 'of',
];