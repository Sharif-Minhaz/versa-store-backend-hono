import { Context, Next } from "hono";
import { throwError } from "../utils";

const uploadAll = async (ctx: Context, next: Next) => {
	const fieldName = "shopPhoto";
	const fieldName2 = "image";
	const contentType = ctx.req.header("content-type");

	if (!contentType?.startsWith("multipart/form-data")) {
		return throwError("Invalid content type", 400);
	}

	const formData = await ctx.req.formData();
	const file = formData.get("shopPhoto");
	const file2 = formData.get("image");

	// Validate file type
	const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
	if (file && !allowedTypes.includes((file as File).type)) {
		return throwError("Invalid file type", 400);
	}

	if (file2 && !allowedTypes.includes((file2 as File).type)) {
		return throwError("Invalid file type", 400);
	}

	if (file) {
		ctx.set(fieldName, file); // shopPhoto
	}

	if (file2) {
		ctx.set(fieldName2, file2); // image
	}

	await next();
};

export default uploadAll;
