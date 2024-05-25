export const notFound = () => {
	const error = new Error("Not found");
	(error as any).statusCode = 404;
	return error;
};
