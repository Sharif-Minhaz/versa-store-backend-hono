import { Context, Next } from "hono";
import { throwError } from "../utils";
import { secrets } from "../configs";
import { verify } from "hono/jwt";

// Middleware to check if user is authenticated
export const checkAuth = async (ctx: Context, next: Next) => {
	const authHeader = ctx.req?.header("Authorization");
	const token = authHeader?.split(" ")[1]; // Extract Bearer token

	if (!token) {
		return ctx.json({ success: false, message: "Token is missing, not authenticated" }, 400);
	}

	const decoded = await verify(token, secrets.secretKey!);

	if (!decoded) {
		return ctx.json({ success: false, message: "Invalid token, verification failed" }, 401);
	}

	if (decoded.type !== "access") {
		return ctx.json(
			{ success: false, message: "Invalid token type, required an access token" },
			403
		);
	}

	ctx.set("user", decoded); // Store the decoded token in the context

	return await next();
};

// Middleware to check if user is an admin
export const checkAdmin = async (ctx: Context, next: Next) => {
	const user = ctx.get("user");

	if (!user) {
		return throwError("Not an authenticated user", 403); // Unauthorized
	}

	if (user.user_type === "admin") {
		return await next();
	}

	throwError("User is not an admin", 403); // User is not an admin
};

// check if user is guest
export const checkGuest = async (ctx: Context, next: Next) => {
	const authHeader = ctx.req?.header("Authorization");
	const token = authHeader?.split(" ")[1]; // Extract Bearer token

	if (!token) {
		return await next();
	}

	try {
		const decoded = await verify(token, secrets.secretKey!);

		if (decoded) {
			return ctx.json(
				{
					success: false,
					message: "You are already logged in",
				},
				403
			);
		}
	} catch (err) {
		console.error("🚀 ~ checkGuest ~ err:", err);
		return await next();
	}
};

export const checkAdminVendor = (ctx: Context, next: Next) => {
	const user = ctx.get("user");

	if (!user) {
		return throwError("Not an authenticated user", 403); // Unauthorized
	}

	if (user.user_type === "admin" || user.user_type === "vendor") {
		return next();
	} else {
		return throwError("User is not an admin nor a vendor", 403);
	}
};
