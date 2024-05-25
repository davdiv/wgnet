import { createComparatorWithRange, findIndexInSortedArray } from "./comparisons";

export class RangeSet<T> {
	readonly ranges: [T, T][] = [];
	readonly #computeAdjacent: (a: T, increment: -1 | 1) => T;
	readonly #compare: (a: T, b: T) => number;
	readonly #compareWithRange: (a: T, b: [T, T]) => number;

	constructor(computeAdjacent: (a: T, increment: -1 | 1) => T, compare: (a: T, b: T) => number, compareWithRange = createComparatorWithRange(compare)) {
		this.#computeAdjacent = computeAdjacent;
		this.#compare = compare;
		this.#compareWithRange = compareWithRange;
	}

	#findRanges(start: T, end = start) {
		const ranges = this.ranges;
		const comparison = this.#compare(start, end);
		if (comparison > 0) {
			[start, end] = [end, start];
		} else if (comparison === 0) {
			start = end;
		}
		const startPos = findIndexInSortedArray(ranges, start, this.#compareWithRange);
		const endPos = start === end ? startPos : findIndexInSortedArray(ranges, end, this.#compareWithRange);
		return { startPos, endPos, start, end };
	}

	add(_start: T, _end?: T): boolean {
		const { startPos, endPos, start, end } = this.#findRanges(_start, _end);
		if (startPos.found && endPos.found && startPos.index === endPos.index) {
			// nothing to do, the range is already fully included
			return false;
		}
		const ranges = this.ranges;
		let replaceStartIndex = startPos.index;
		let replaceEndIndex = endPos.index;
		const rangeToAdd: [T, T] = [start, end];
		if (startPos.found) {
			rangeToAdd[0] = startPos.value[0];
		}
		if (endPos.found) {
			rangeToAdd[1] = endPos.value[1];
			replaceEndIndex++;
		}
		if (replaceStartIndex > 0) {
			// merge with previous range if possible
			const prevRange = ranges[replaceStartIndex - 1];
			if (this.#compare(this.#computeAdjacent(prevRange[1], 1), rangeToAdd[0]) === 0) {
				replaceStartIndex--;
				rangeToAdd[0] = prevRange[0];
			}
		}
		if (replaceEndIndex < ranges.length) {
			// merge with following range if possible
			const nextRange = ranges[replaceEndIndex];
			if (this.#compare(this.#computeAdjacent(rangeToAdd[0], 1), nextRange[0]) === 0) {
				replaceEndIndex++;
				rangeToAdd[1] = nextRange[1];
			}
		}
		ranges.splice(replaceStartIndex, replaceEndIndex - replaceStartIndex, rangeToAdd);
		return true;
	}

	remove(_start: T, _end?: T): boolean {
		const { startPos, endPos, start, end } = this.#findRanges(_start, _end);
		if (!startPos.found && !endPos.found && startPos.index === endPos.index) {
			// nothing to do, the range is already fully excluded
			return false;
		}
		const ranges = this.ranges;
		const rangesToAdd: [T, T][] = [];
		const replaceStartIndex = startPos.index;
		let replaceEndIndex = endPos.index;
		if (startPos.found) {
			if (this.#compare(startPos.value[0], start) < 0) {
				rangesToAdd.push([startPos.value[0], this.#computeAdjacent(start, -1)]);
			}
		}
		if (endPos.found) {
			if (this.#compare(end, endPos.value[1]) < 0) {
				rangesToAdd.push([this.#computeAdjacent(end, 1), endPos.value[1]]);
			}
			replaceEndIndex++;
		}
		ranges.splice(replaceStartIndex, replaceEndIndex - replaceStartIndex, ...rangesToAdd);
		return true;
	}

	containsAll(_start: T, _end?: T): boolean {
		const { startPos, endPos } = this.#findRanges(_start, _end);
		return startPos.found && endPos.found && startPos.index === endPos.index;
	}

	containsSome(_start: T, _end?: T): boolean {
		const { startPos, endPos } = this.#findRanges(_start, _end);
		return startPos.found || endPos.found || startPos.index !== endPos.index;
	}
}
