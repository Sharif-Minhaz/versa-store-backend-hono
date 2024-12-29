import { logger } from "hono/logger";
import { cors } from "hono/cors";
import useArcjet from "./arcjet.middleware";

export const useMiddlewares = () => {
	return [
		logger(),
		useArcjet,
		cors({
			origin: [
				"http://localhost:5173",
				"http://localhost:5174",
				"http://localhost:3001",
				"https://next-bun-shop-frontend.vercel.app",
			],
			credentials: true,
			allowHeaders: ["Authorization", "Content-Type", "Accept"],
		}),
	];
};
