import { model, models, Schema } from "mongoose";

const adminSchema = new Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		phone: String,
		image: { type: String, default: "https://randomuser.me/api/portraits/lego/7.jpg" },
		imageKey: String,
		user_type: { type: String, default: "admin" },
	},
	{ timestamps: true }
);

const Admin = models.Admin || model("Admin", adminSchema);

export default Admin;
