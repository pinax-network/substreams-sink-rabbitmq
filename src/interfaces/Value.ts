type CaseStr = "int32" | "bigdecimal" | "bigint" | "string" | "bytes" | "bool" | "array";
type Case = Number | bigint | string | boolean | Array<any>;

export interface Value {
    typed: {
        case: CaseStr;
        value: Case;
    }
}