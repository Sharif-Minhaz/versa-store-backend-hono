import { model, models, Schema } from "mongoose";

const customerSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			immutable: true,
		},
		password: { type: String, select: false },
		loginMethod: {
			type: String,
			enum: ["google", "form"],
			default: "google",
		},
		phone: String,
		image: { type: String, default: "https://randomuser.me/api/portraits/lego/5.jpg" },
		imageKey: String,
		bookmarks: [{ type: Schema.Types.ObjectId, ref: "Product" }],
		isBan: { type: Boolean, default: false },
		user_type: { type: String, default: "customer" },
	},
	{ timestamps: true }
);

const Customer = models.Customer || model("Customer", customerSchema);

export default Customer;
