import { Hono } from "hono";

import ReviewControllers from "../controllers/review.controllers";
import { catchAsync } from "../utils";
import { checkAuth } from "../middlewares/auth.middlewares";

const router = new Hono();

router.get("/:productId", catchAsync(ReviewControllers.findReviews));
router.post("/:productId", catchAsync(checkAuth), catchAsync(ReviewControllers.addReview));
router.delete("/:reviewId", catchAsync(checkAuth), catchAsync(ReviewControllers.deleteReview));

export default router;
