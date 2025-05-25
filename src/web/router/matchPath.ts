import type { Key } from "path-to-regexp";
import { pathToRegexp } from "path-to-regexp";

const pathCache: Record<string, { regexp: RegExp; keys: Key[] }> = {};

export function compilePath(path: string, prefix = false) {
	const cacheKey = `${path}-${prefix}`;
	let result = pathCache[cacheKey];
	if (!result) {
		result = pathToRegexp(path, { end: !prefix, sensitive: true });
		pathCache[cacheKey] = result;
	}
	return result;
}

export interface Match {
	path: string;
	url: string;
	params: Record<string, string>;
}

export function matchPath(pathname: string, paths: string | string[], prefix = false): null | Match {
	if (!Array.isArray(paths)) {
		paths = [paths];
	}
	for (const path of paths) {
		const { regexp, keys } = compilePath(path, prefix);
		const match = regexp.exec(pathname);
		if (match) {
			const params: Record<string, string> = {};
			for (let i = 0, l = keys.length; i < l; i++) {
				const key = keys[i];
				const value = match[i + 1];
				if (value != null) {
					params[key.name] = value;
				}
			}
			return { path, url: match[0], params };
		}
	}
	return null;
}
