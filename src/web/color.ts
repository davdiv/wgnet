export const oppositeColor = (color: string | null) => {
	if (color) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		const sum = r + g + b;
		return sum < 382 ? "#ffffff" : "#000000";
	}
};
