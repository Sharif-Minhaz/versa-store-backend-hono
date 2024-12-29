import { model, models, Schema } from "mongoose";

const vendorSchema = new Schema(
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
		image: { type: String, default: "https://randomuser.me/api/portraits/lego/5.jpg" },
		imageKey: String,
		shopName: {
			type: String,
			required: true,
		},
		shopLicenseNo: {
			type: String,
			required: true,
		},
		shopType: {
			type: String,
			required: true,
		},
		shopPhoto: {
			type: String,
			required: true,
		},
		shopPhotoKey: String,
		shopAddress: {
			type: String,
			required: true,
		},
		isBan: { type: Boolean, default: false },
		user_type: { type: String, default: "vendor" },
	},
	{ timestamps: true }
);

const Vendor = models.Vendor || model("Vendor", vendorSchema);

export default Vendor;
