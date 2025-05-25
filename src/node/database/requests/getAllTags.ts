import type { StatementSync } from "node:sqlite";
import type { DBTag } from "../types";

export type TagInfo = DBTag;

export default (statement: StatementSync) => (): TagInfo[] => statement.all() as any;
