import { model, models, Schema } from "mongoose";

const reviewSchema = new Schema(
	{
		productId: {
			type: Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true,
		},
		review: String,
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			refPath: "userIdModel",
		},
		userIdModel: {
			type: String,
			required: true,
			enum: ["Vendor", "Admin", "Customer"],
			default: "Customer",
		},
	},
	{ timestamps: true }
);

const Review = models.Review || model("Review", reviewSchema);

export default Review;
