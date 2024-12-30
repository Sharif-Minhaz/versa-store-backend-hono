import { verify } from "hono/jwt";
import Customer from "../models/Customer.model";
import Admin from "../models/Admin.model";
import Vendor from "../models/Vendor.model";
import { secrets } from "../configs";
import { getNewTokens } from "../utils";
import { throwError } from "../utils";
import { passwordHashing } from "../utils/hashing";
import { uploadImageHandler } from "../utils/uploadImage";
import { deleteImage } from "../utils/deleteImage";
import { BANNED_MESSAGE } from "../consts";
import { Context } from "hono";

const checkIfUserExists = async (email: string) => {
	const [customer, vendor, admin] = await Promise.all([
		Customer.exists({ email }),
		Vendor.exists({ email }),
		Admin.exists({ email }),
	]);

	return { customer, vendor, admin };
};

const refreshToken = async (refreshToken: string) => {
	const decoded: any = await verify(refreshToken, secrets.refreshSecretKey!);

	if (!decoded) {
		return throwError("Invalid refresh token", 401);
	}

	if (decoded.type !== "refresh") {
		return throwError("Invalid token type", 401);
	}

	// check if customer exists
	const { customer, vendor, admin } = await checkIfUserExists(decoded.email);
	let user = null;

	// registration based on role
	if (admin) {
		user = await Admin.findById(decoded._id);
	} else if (vendor) {
		// for vendor type user
		// update the vendor user
		user = await Vendor.findById(decoded._id);
	} else if (customer) {
		// update admin
		user = await Customer.findById(decoded._id);
	}

	if (!user) {
		return throwError("User not found", 404);
	}

	const tokens = getNewTokens(user);

	return tokens;
};

const customerRegistration = async (body: any) => {
	const { password, email, fullName } = body;
	const { customer, vendor, admin } = await checkIfUserExists(email);

	if (customer || vendor || admin) {
		return throwError("Customer already exists", 409);
	}

	// hash the plain password
	const hashedPassword = await passwordHashing(password);

	const newCustomerData = {
		email,
		fullName,
		password: hashedPassword,
		loginMethod: "form",
	};

	const newUser = await Customer.create(newCustomerData);
	return newUser;
};

const vendorRegistration = async (body: any, file: File) => {
	const { email, fullName, password, shopName, shopLicenseNo, shopType, shopAddress } = body;

	const { customer, vendor, admin } = await checkIfUserExists(email);

	if (customer || vendor || admin) {
		return throwError("Email already connected with another user.", 409);
	}

	// hash the password
	const hashedPassword = await passwordHashing(password);

	if (!hashedPassword) {
		return throwError("Error hashing password", 500);
	}

	let photoUpload = { secure_url: "", public_id: "" };
	// upload the photo into cloudinary, if there any
	if (file) {
		photoUpload = await uploadImageHandler(file);
	}

	const newVendorData = {
		email,
		fullName,
		password: hashedPassword,
		shopName,
		shopLicenseNo,
		shopType,
		shopAddress,
		shopPhoto: photoUpload ? photoUpload.secure_url : undefined, // omit the filed if there is not photo
		shopPhotoKey: photoUpload ? photoUpload.public_id : "",
	};

	const user = await Vendor.create(newVendorData);

	return user;
};

// update user
const customerUpdate = async (ctx: Context) => {
	const body = await ctx.req.parseBody({ dot: true });
	const userId = ctx.get("user")?._id;
	const file = ctx.get("image");
	if (!userId) throwError("User id required", 400);

	const customer = await Customer.findById(userId);

	if (!customer) throwError("Customer not found", 404);
	if (customer.isBan) throwError(BANNED_MESSAGE, 401);

	let photoUpload = null;
	// upload the photo into cloudinary, if there any
	if (file) {
		photoUpload = await uploadImageHandler(file);

		// delete prev image
		if (customer.imageKey) await deleteImage(customer.imageKey);
	}

	// update the customer user
	const user = await Customer.findByIdAndUpdate(
		userId,
		{
			...body,
			image: photoUpload ? photoUpload.secure_url : customer.image,
			imageKey: photoUpload ? photoUpload.public_id : customer.imageKey,
		},
		{ new: true }
	).lean();

	return user;
};

// vendor update
const vendorUpdate = async (ctx: Context) => {
	const body = await ctx.req.parseBody({ dot: true });
	const file = ctx.get("image");
	const shopPhotos = ctx.get("shopPhotos");
	const userId = ctx.get("user")?._id;
	if (!userId) throwError("User id required", 400);

	const vendor = await Vendor.findById(userId);

	if (!vendor) throwError("Vendor not found", 404);
	if (vendor.isBan) throwError(BANNED_MESSAGE, 401);

	let photoUpload = null,
		shopPhotoUpload = null;
	// upload the photo into cloudinary, if there any
	if (file) {
		photoUpload = await uploadImageHandler(file);

		// delete prev image
		if (vendor.imageKey) await deleteImage(vendor.imageKey);
	}

	if (shopPhotos) {
		shopPhotoUpload = await uploadImageHandler(shopPhotos);

		// delete prev image
		if (vendor.shopPhotoKey) await deleteImage(vendor.shopPhotoKey);
	}

	// update the vendor user
	const user = await Vendor.findByIdAndUpdate(
		userId,
		{
			...body,
			image: photoUpload ? photoUpload.secure_url : vendor.image,
			imageKey: photoUpload ? photoUpload.public_id : vendor.imageKey,
			shopPhoto: shopPhotoUpload ? shopPhotoUpload.secure_url : vendor.shopPhoto,
			shopPhotoKey: shopPhotoUpload ? shopPhotoUpload.public_id : vendor.shopPhotoKey,
		},
		{ new: true }
	);

	return user;
};

// admin update
const adminUpdate = async (ctx: Context) => {
	const body = await ctx.req.parseBody({ dot: true });
	const file = ctx.get("image");
	const userId = ctx.get("user")?._id;
	if (!userId) throwError("User id required", 400);

	const admin = await Admin.findById(userId);

	if (!admin) throwError("Admin is not found", 404);
	if (admin.isBan) throwError(BANNED_MESSAGE, 401);

	let photoUpload = null;
	// upload the photo into cloudinary, if there any
	if (file) {
		photoUpload = await uploadImageHandler(file);

		// delete prev image
		if (admin.imageKey) await deleteImage(admin.imageKey);
	}

	// update the admin user
	const user = await Admin.findByIdAndUpdate(
		userId,
		{
			...body,
			image: photoUpload ? photoUpload.secure_url : admin.image,
			imageKey: photoUpload ? photoUpload.public_id : admin.imageKey,
		},
		{ new: true }
	).lean();

	return user;
};

export const AuthServices = {
	refreshToken,
	customerRegistration,
	vendorRegistration,
	customerUpdate,
	vendorUpdate,
	adminUpdate,
};
