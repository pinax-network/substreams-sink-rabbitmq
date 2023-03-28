import { Field } from "./Field";

enum Operation {
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
    fields: Array<Field>;
}