import { Context, Next } from "hono";
import { ITokenPayloadUser, ThrowError } from "../types";
import { sign } from "hono/jwt";
import { secrets } from "../configs";

export const catchAsync = (fn: (c: Context, next: Next) => Promise<any>) => {
	return async (ctx: Context, next: Next) => {
		try {
			return await fn(ctx, next);
		} catch (err: any) {
			console.error("🚀 ~ return ~ err:", err);
			return ctx.json(
				{ success: false, message: typeof err === "string" ? err : err.message },
				err.status || 500
			);
		}
	};
};

export const throwError = (message: string, status = 500) => {
	const error: ThrowError = new Error(message) as ThrowError;
	error.status = status;

	throw error;
};

export const getNewTokens = async (user: ITokenPayloadUser) => {
	const accessToken = await sign(
		{
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			user_type: user.user_type,
			image: user.image,
			type: "access",
			exp: (Math.floor(Date.now() / 1000) + 60) * secrets.jwtExpiresIn!, // 10 minutes
		},
		secrets.secretKey!
	);

	const refreshToken = await sign(
		{
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			user_type: user.user_type,
			image: user.image,
			type: "refresh",
			exp: (Math.floor(Date.now() / 1000) + 60) * secrets.refreshJwtExpiresIn!, // 1440 minutes -> 1 day
		},
		secrets.refreshSecretKey!
	);

	return { accessToken, refreshToken };
};

export const capitalize = (str: string) => {
	const words = str.toLowerCase();
	const capitalizedWords = words.replace(words.charAt(0), words.charAt(0).toUpperCase());
	return capitalizedWords;
};
