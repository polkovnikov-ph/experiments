import { decoder, runDecoder } from "./decode-json";
import { encoder, runEncoder } from "./encode-json";
import { apply } from "./ft";
import { Json } from "./lodash";
import { intersect, number, object, string, unionUnsafe } from "./type";

const A = unionUnsafe
    .add('a', string)
    .add('b', number)
    .end;

const B = intersect
    .add(object({a: string}))
    .add(object({b: number}))
    .end;

const Test = object({
    a: A,
    b: B,
});

const test: Json = {a: '1', b: {a: '2', b: 1}};
const decodeF = apply(Test, decoder);
const d = runDecoder(decodeF, test);
console.log(d);
const encodeF = apply(Test, encoder);
const e = runEncoder(encodeF, d);
console.log(e);

// TODO:
// - ref, memo
// - [Onto.BlahTerm]: BlahTerm<T>
// - [term, termTag] = define()
// - don't export Context, add opaques
// - API PoC: only `number` and `method`, figure out how multiple typeclass instances can work
// - /*#__PURE__*/