import { MapOutput, unpack } from "substreams";
import { MessageType, AnyMessage } from "@bufbuild/protobuf";

export const MESSAGE_TYPE_NAME = 'substreams.entity.v1.EntityChanges';

export function decode(message: MessageType<AnyMessage>, output: MapOutput): EntityChange[] | null {
    if (!output.data.value.typeUrl.match(MESSAGE_TYPE_NAME)) return null;
    return message.fromBinary(output.data.value.value).entityChanges as any;
}

export function findMessage(binary: Uint8Array) {
    const { registry } = unpack(binary);
    const message = registry.findMessage(MESSAGE_TYPE_NAME);
    if (!message) throw new Error(`Could not find [${MESSAGE_TYPE_NAME}] message type`);
    return message;
}

export type CaseStr = "int32" | "bigdecimal" | "bigint" | "string" | "bytes" | "bool" | "array";
export type Case = Number | bigint | string | boolean | Array<any>;

export interface Value {
    typed: {
        case: CaseStr;
        value: Case;
    }
}

export interface Field {
    name: string;
    newValue: Value;
}
export enum Operation {
    UNSET,
    CREATE,
    UPDATE,
    DELETE,
}

export interface EntityChange {
    entity: string;
    id: string;
    ordinal: bigint;
    operation: Operation;
    fields: Field[];
}