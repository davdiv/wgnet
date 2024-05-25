export const findIndexInSortedArray = <T, U>(
	array: T[],
	item: U,
	compare: (a: U, b: T) => number,
	startIndex = 0,
	endIndex = array.length - 1,
): { found: true; index: number; value: T } | { found: false; index: number } => {
	let currentIndex = startIndex;
	while (endIndex >= startIndex) {
		currentIndex = (startIndex + endIndex) >> 1;
		const element = array[currentIndex];
		const comparison = compare(item, element);
		if (comparison < 0) {
			endIndex = currentIndex - 1;
		} else if (comparison > 0) {
			startIndex = currentIndex + 1;
		} else {
			return { found: true, index: currentIndex, value: element };
		}
	}
	return { found: false, index: startIndex };
};

export const createComparatorWithRange =
	<T>(compare: (a: T, b: T) => number) =>
	(item: T, range: [T, T]) => {
		const withFirst = compare(item, range[0]);
		if (withFirst <= 0) {
			return withFirst;
		}
		const withLast = compare(item, range[1]);
		if (withLast >= 0) {
			return withLast;
		}
		return 0;
	};
