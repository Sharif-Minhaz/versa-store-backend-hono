import Review from "../models/Review.model";
import Product from "../models/Product.model";
import { throwError } from "../utils";
import { Context } from "hono";

const addReview = async (ctx: Context) => {
	const user = ctx.get("user");
	const productId = ctx.req.param("productId");
	const { rating, review } = await ctx.req.json();
	const { _id: userId, user_type } = user;

	if (!productId) return throwError("Product id required", 400);

	// check if the product exists
	const productExists = await Product.exists({ _id: productId });
	if (!productExists) return throwError("Product not found", 404);

	// check if user has already reviewed this product
	const existingReview = await Review.findOne({ productId, userId });
	if (existingReview) return throwError("You have already reviewed this product", 409);

	// create a new review
	const newReview = await Review.create({
		productId,
		rating,
		review,
		userId,
		userIdModel: user_type.replace(user_type.charAt(0), user_type.charAt(0).toUpperCase()),
	});

	return ctx.json(
		{ success: true, message: "Review added successfully", review: newReview },
		201
	);
};

// find all reviews for a specific product
const findReviews = async (ctx: Context) => {
	const productId = ctx.req.param("productId");

	if (!productId) throwError("Product id required", 400);

	// fetch all reviews for the product
	const reviews = await Review.find({ productId })
		.populate({
			path: "userId",
			select: "fullName image",
		})
		.lean();

	return ctx.json({ success: true, message: "Reviews fetched successfully", reviews }, 200);
};

// delete a review
const deleteReview = async (ctx: Context) => {
	const reviewId = ctx.req.param("reviewId");
	const user = ctx.get("user");
	const { _id: userId, user_type } = user;

	// find the review by ID
	const review = await Review.findById(reviewId);
	if (!review) throwError("Review not found", 404);

	// check if the user is authorized to delete (either review owner or an admin)
	if (review.userId.toString() !== userId && user_type !== "admin") {
		throwError("Not authorized to delete this review", 403);
	}

	// delete the review
	await review.deleteOne();

	return ctx.json({ success: true, message: "Review deleted successfully" }, 200);
};

const ReviewControllers = {
	addReview,
	findReviews,
	deleteReview,
};

export default ReviewControllers;
