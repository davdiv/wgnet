import type { Statement } from "better-sqlite3";
import { notFound } from "../notFound";

export const parseColumns =
	(...columns: string[]) =>
	(content: any) => {
		if (!content) return content;
		const res = { ...content };
		for (const column of columns) {
			res[column] = JSON.parse(content[column]);
		}
		return res;
	};

export const createRunStatementReturnId =
	<T>(statement: Statement) =>
	(item: T): number =>
		statement.run(item).lastInsertRowid as number;

export const createRunStatementCheckChange =
	<T>(statement: Statement) =>
	(item: T) => {
		if (statement.run(item).changes === 0) {
			throw notFound();
		}
	};

export const createRunStatement =
	<T>(statement: Statement) =>
	(item: T) => {
		statement.run(item);
	};
