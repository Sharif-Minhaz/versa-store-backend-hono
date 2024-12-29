import { Hono } from "hono";
import { catchAsync } from "../utils";
import { checkAuth, checkGuest } from "../middlewares/auth.middlewares";
import { validateUserLogin, validateUserReg } from "../validators/authValidators";
import { zValidator } from "@hono/zod-validator";
import upload from "../middlewares/upload";
import AuthControllers from "../controllers/auth.controllers";
import uploadAll from "../middlewares/uploadAll";

const router = new Hono();

// authentication user
router.post(
	"/register",
	catchAsync(checkGuest),
	catchAsync(upload("shopPhoto")),
	zValidator("form", validateUserReg),
	catchAsync(AuthControllers.register)
);
router.post(
	"/login",
	catchAsync(checkGuest),
	zValidator("json", validateUserLogin),
	catchAsync(AuthControllers.login)
);
router.post("/google", catchAsync(checkGuest), catchAsync(AuthControllers.continueWithGoogle));

router.patch(
	"/update",
	catchAsync(checkAuth),
	catchAsync(upload("shopPhoto")),
	catchAsync(AuthControllers.updateUser)
);

router.post("/refresh-token", catchAsync(AuthControllers.refreshToken));

router.get("/profile", catchAsync(checkAuth), catchAsync(AuthControllers.getProfile));

export default router;
