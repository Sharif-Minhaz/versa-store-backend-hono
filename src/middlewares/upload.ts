import { Context, Next } from "hono";
import { throwError } from "../utils";

const upload = (fieldName: string) => async (ctx: Context, next: Next) => {
	const contentType = ctx.req.header("content-type");

	if (!contentType?.startsWith("multipart/form-data")) {
		return throwError("Invalid content type", 400);
	}

	const formData = await ctx.req.formData();
	const file = formData.get(fieldName);

	// Validate file type and bind the file with the context
	if (file) {
		// Validate file type
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		];
		if (!allowedTypes.includes((file as File).type)) {
			return throwError("Invalid file type", 400);
		}

		ctx.set(fieldName, file);
	}

	await next();
};

export default upload;
