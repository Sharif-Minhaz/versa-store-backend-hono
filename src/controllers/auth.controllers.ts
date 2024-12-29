import { Context } from "hono";
import { AuthServices } from "../services/auth.services";
import { getNewTokens, throwError } from "../utils";
import Customer from "../models/Customer.model";
import Vendor from "../models/Vendor.model";
import Admin from "../models/Admin.model";
import { BANNED_MESSAGE } from "../consts";
import { ITokenPayloadUser, IUser } from "../types";
import { hashCompare } from "../utils/hashing";

// **************** customer's login system ****************
const login = async (ctx: Context) => {
	const { email, password, loginFor = "customer" } = await ctx.req.json();

	let user = null;
	// get the user info based on the role
	if (loginFor === "customer") {
		user = await Customer.findOne({ email }).select("+password").lean();
	} else if (loginFor === "vendor") {
		user = await Vendor.findOne({ email }).select("+password").lean();
	} else {
		// admin use-case
		user = await Admin.findOne({ email }).select("+password").lean();
	}

	if (!user) return throwError("User not found", 404);
	const loggedInUser: IUser = user as unknown as IUser;
	if (loggedInUser.isBan) return throwError(BANNED_MESSAGE, 401);

	// check for matching password
	const isPasswordCorrect = await hashCompare(password, loggedInUser.password);

	if (!isPasswordCorrect) throwError("Invalid password", 400);

	// generate tokens
	const tokens = await getNewTokens(user as unknown as ITokenPayloadUser);

	// removing the password field from user
	const userInfo = Object.assign({}, loggedInUser);
	const { password: psw, ...userWithoutPassword } = userInfo;

	return ctx.json(
		{
			message: "Login successful",
			success: true,
			user: userWithoutPassword,
			tokens,
		},
		200
	);
};

async function register(ctx: Context) {
	const file: File = ctx.get("shopPhoto");
	const body = await ctx.req.parseBody({ dot: true });

	const { registerFor = "customer" } = body;

	let user = null;
	// registration based on role
	if (registerFor === "customer") {
		// create the customer user
		user = await AuthServices.customerRegistration(body);
	} else {
		// for vendor type user
		// create the vendor user
		if (!file) return throwError("Shop image is required for validation", 400);
		user = await AuthServices.vendorRegistration(body, file);
	}

	if (!user) throwError("Error registering user");

	// delete the user password
	const userInfo = Object.assign({}, user);
	delete userInfo.password;

	return ctx.json(
		{
			success: true,
			user: userInfo._doc,
		},
		201
	);
}

// **************** google login ****************
const continueWithGoogle = async (ctx: Context) => {
	const { email, name, picture, loginFor = "customer" } = await ctx.req.json();

	// Check if the user already exists with form-based login
	const formUser = await Customer.findOne({
		email,
		loginMethod: "form",
		isBan: false,
		user_type: loginFor,
	}).lean();

	if (formUser) {
		// Form login exists, ask them to use password login instead
		return throwError(
			"This email is already registered with form. Please login with your password instead.",
			409
		);
	}

	// Find or create a Google-based user
	let user = await Customer.findOne({
		email,
		loginMethod: "google",
		isBan: false,
		user_type: loginFor,
	}).lean();

	if (!user) {
		// Create a new user for first-time Google login
		user = await Customer.create({
			fullName: name,
			email,
			loginMethod: "google",
			image: picture,
			user_type: "customer",
		}).then((doc) => doc.toObject());
	}

	// Generate tokens for the user
	const tokens = await getNewTokens(user as unknown as ITokenPayloadUser);

	return ctx.json(
		{
			message: "Login with Google is successful",
			success: true,
			user,
			tokens,
		},
		200
	);
};

// **************** refresh token generators ********************
const refreshToken = async (ctx: Context) => {
	const { refreshToken } = (await ctx.req.json()) || {};

	if (!refreshToken) return throwError("Please provide a refresh Token", 400);

	const tokens = await AuthServices.refreshToken(refreshToken);

	if (!tokens) return throwError("Invalid refresh token", 401);

	return ctx.json({ success: true, tokens }, 200);
};

// **************** update user ****************
const updateUser = async (ctx: Context) => {
	const updateFor = ctx.get("user")?.user_type;

	if (!updateFor) throwError("Got no user information", 500);

	let user = null;
	// registration based on role
	if (updateFor === "customer") {
		// update the customer user
		user = await AuthServices.customerUpdate(ctx);
	} else if (updateFor === "vendor") {
		// for vendor type user
		// update the vendor user
		user = await AuthServices.vendorUpdate(ctx);
	} else {
		// update admin
		user = await AuthServices.adminUpdate(ctx);
	}

	if (!user) throwError("Error registering user");
	if (user.isBan) throwError(BANNED_MESSAGE, 401);

	return ctx.json(
		{
			success: true,
			user,
		},
		200
	);
};

const getProfile = async (ctx: Context) => {
	const updateFor = ctx.get("user")?.user_type;
	const userId = ctx.get("user")?._id;

	if (!updateFor || !userId) throwError("Got no user information", 500);

	let user = null;
	// registration based on role
	if (updateFor === "customer") {
		// update the customer user
		user = await Customer.findById(userId)
			.populate({
				path: "bookmarks",
				select: "name description price images",
			})
			.lean();
	} else if (updateFor === "vendor") {
		// for vendor type user
		// update the vendor user
		user = await Vendor.findById(userId).lean();
	} else {
		// update admin
		user = await Admin.findById(userId).lean();
	}

	return ctx.json({ success: true, profile: user }, 200);
};

const AuthControllers = {
	register,
	login,
	continueWithGoogle,
	refreshToken,
	updateUser,
	getProfile,
};

export default AuthControllers;
