import { Hono } from "hono";
import CategoryControllers from "../controllers/category.controllers";
import { checkAdminVendor, checkAuth } from "../middlewares/auth.middlewares";
import upload from "../middlewares/upload";
import { catchAsync } from "../utils";
import validateCategory from "../validators/categoryValidators";
import { zValidator } from "@hono/zod-validator";

const router = new Hono();

router.get("/", catchAsync(CategoryControllers.getAllCategories));
router.post(
	"/",
	catchAsync(checkAuth),
	catchAsync(checkAdminVendor),
	catchAsync(upload("categoryPhoto")),
	zValidator("form", validateCategory),
	catchAsync(CategoryControllers.addCategory)
);

router.get("/find/:categoryId", catchAsync(CategoryControllers.findSingleCategory));

export default router;
