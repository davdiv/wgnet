import type { Statement } from "better-sqlite3";
import type { DBTag } from "../types";

export type TagInfo = DBTag;

export default (statement: Statement) => (): TagInfo[] => statement.all() as any;
