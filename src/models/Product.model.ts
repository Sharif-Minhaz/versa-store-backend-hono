import { model, Schema, models } from "mongoose";

const productSchema = new Schema(
	{
		addedBy: {
			type: Schema.Types.ObjectId,
			required: true,
			refPath: "addedByModel",
		},
		addedByModel: {
			type: String,
			required: true,
			enum: ["Vendor", "Admin"],
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			min: 1,
			required: true,
		},
		discount: {
			type: Number,
			default: 0,
		},
		images: [{ url: String, publicId: String }],
		brand: String,
		stock: {
			type: Number,
			min: 1,
			required: true,
		},
		sold: {
			type: Number,
			default: 0,
		},
		defaultType: String, // default variant
		variant: [
			{
				type: { type: String, required: true },
				price: { type: Number, min: 1, required: true },
				description: { type: String, required: true },
			},
		],
		deliveryCharge: {
			type: Number,
			default: 50,
		},
	},
	{
		timestamps: true,
	}
);

productSchema.index(
	{
		name: "text",
		description: "text",
	},
	{
		weights: {
			name: 5,
			description: 3,
		},
	}
);

const Product = models.Product || model("Product", productSchema);

export default Product;
