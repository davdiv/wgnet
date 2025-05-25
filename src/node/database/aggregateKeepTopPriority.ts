interface Context {
	best: any;
	priority: number;
}

export const aggregateKeepTopPriority = {
	start: (): Context => ({ best: null, priority: -Infinity }),
	step: (context: Context, newValue: any, priority: number | null) => {
		if (priority != null && priority > context.priority) {
			context.best = newValue;
			context.priority = priority;
		}
		return context;
	},
	result: (context: Context) => context.best,
};
