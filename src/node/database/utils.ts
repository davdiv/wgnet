import type { StatementSync } from "node:sqlite";
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
	<T>(statement: StatementSync) =>
	(item: T): number =>
		statement.run(item as any).lastInsertRowid as number;

export const createRunStatementCheckChange =
	<T>(statement: StatementSync) =>
	(item: T) => {
		if (statement.run(item as any).changes === 0) {
			throw notFound();
		}
	};
