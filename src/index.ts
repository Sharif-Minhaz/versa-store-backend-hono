import { Context, Hono } from "hono";
import { secrets } from "./configs";
import { useMiddlewares } from "./middlewares";
import authRoute from "./routes/auth.routes";
import categoryRoute from "./routes/category.routes";
import connectDB from "./db";

connectDB();

const app = new Hono();
const apiRoute = new Hono();

app.use(...useMiddlewares());

// auth route
apiRoute.route("/auth", authRoute);
apiRoute.route("/categories", categoryRoute);

// base route
app.route("/api/v1", apiRoute);

// health check
app.get("/health", (ctx) => {
	return ctx.json({ success: true, message: "Server is running" }, 200);
});

// default 404 route
app.notFound((ctx) => {
	return ctx.json({ success: false, message: "404 Page not found" }, 404);
});

// global error handler
app.onError((err: Error, ctx: Context) => {
	const statusCode = (err as any).status || 500;
	const message = err.message || "Internal server error";
	const stack = Bun.env.ARCJET_ENV === "production" ? undefined : err.stack;

	console.error("🚀 ~ app.onError ~ err:", err);

	return ctx.json(
		{
			statusCode,
			success: false,
			message,
			stack,
		},
		statusCode
	);
});

export default {
	port: secrets.port,
	fetch: app.fetch,
};
