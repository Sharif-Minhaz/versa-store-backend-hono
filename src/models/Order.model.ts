import { model, models, Schema } from "mongoose";

const orderSchema = new Schema(
	{
		products: [
			{
				product: {
					type: Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				count: {
					type: Number,
					required: true,
					min: 1,
					default: 1,
				},
			},
		],
		orderedBy: {
			type: Schema.Types.ObjectId,
			ref: "Customer",
			required: true,
		},
		orderName: {
			type: String,
			required: true,
		},
		orderMethod: { type: String, enum: ["cash", "online"], required: true },
		deliveryCharge: { type: Number, default: 50 },
		productPrice: { type: Number, required: true },
		totalPrice: { type: Number, required: true },
		division: {
			type: String,
			required: true,
		},
		district: {
			type: String,
			required: true,
		},
		subDistrict: {
			type: String,
			required: true,
		},
		postCode: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		houseNo: String,
		status: {
			type: String,
			enum: ["pending", "declined", "cart", "accepted", "cancelled", "failed"],
			default: "pending",
		},
		tranxId: {
			type: String,
			required: true,
		},
		paymentUrl: String,
		note: String,
	},
	{ timestamps: true }
);

const Order = models.Order || model("Order", orderSchema);

export default Order;
