import arcjet, { detectBot, fixedWindow, shield } from "@arcjet/bun";
import { secrets } from "../configs";
import { Context, Next } from "hono";

const aj = arcjet({
	key: secrets.arcjetKey!, // Get your site key from https://app.arcjet.com
	characteristics: ["ip.src"], // Track requests by IP
	rules: [
		// Shield protects your app from common attacks e.g. SQL injection
		shield({ mode: "LIVE" }),
		// Create a bot detection rule
		detectBot({
			mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
			// Block all bots except the following
			allow: [
				"CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
				// Uncomment to allow these other common bot categories
				// See the full list at https://arcjet.com/bot-list
				//"CATEGORY:MONITOR", // Uptime monitoring services
				//"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
			],
		}),
		fixedWindow({
			mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
			window: "60s", // 60 second fixed window
			max: 100, // allow a maximum of 100 requests
		}),
	],
});
export default async function useArcjet(ctx: Context, next: Next) {
	const decision = await aj.protect(ctx.req.raw);
	console.log("Arcjet decision:", decision.conclusion);

	if (decision.isDenied()) {
		if (decision.reason.isRateLimit()) {
			return ctx.json({ success: false, message: "Too many requests" }, 429);
		} else if (decision.reason.isBot()) {
			return ctx.json({ success: false, message: "No bots allowed, Go away" }, 403);
		} else {
			return ctx.json({ success: false, message: "Forbidden" }, 403);
		}
	}

	// Arcjet Pro plan verifies the authenticity of common bots using IP data.
	// Verification isn't always possible, so we recommend checking the decision
	// separately.
	// https://docs.arcjet.com/bot-protection/reference#bot-verification
	if (decision.reason.isBot() && decision.reason.isSpoofed()) {
		return ctx.json({ success: false, message: "Forbidden" }, 403);
	}

	return await next();
}
