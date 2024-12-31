import { Context } from "hono";
import Category from "../models/Category.model";
import { throwError } from "../utils";
import { uploadImageHandler } from "../utils/uploadImage";

const getAllCategories = async (ctx: Context) => {
	const categories = await Category.find().lean();

	return ctx.json(
		{
			success: true,
			categories,
		},
		200
	);
};

const addCategory = async (ctx: Context) => {
	const imageFile: File = ctx.get("image");
	const { name } = await ctx.req.parseBody({ dot: true });

	// check if the category already exist
	const isCategoryExist = await Category.exists({
		name: { $regex: new RegExp("^" + name + "$", "i") },
	});

	if (isCategoryExist) return throwError("Category already exist", 409);

	if (!imageFile) return throwError("Category image is required", 400);

	// upload category image
	const uploadImg = await uploadImageHandler(imageFile);

	if (!uploadImg) return throwError("Error uploading image");

	// create the category
	const category = await Category.create({
		name,
		image: uploadImg.secure_url,
		imageKey: uploadImg.public_id,
	});

	return ctx.json(
		{
			success: true,
			category,
		},
		201
	);
};

const findSingleCategory = async (ctx: Context) => {
	const categoryId = ctx.req.param("categoryId");

	if (!categoryId) throwError("Category id is required", 400);

	// get the category
	const category = await Category.findById(categoryId).lean();

	if (!category) throwError("This category doesn't exist", 404);

	return ctx.json(
		{
			success: true,
			category,
		},
		200
	);
};

const CategoryControllers = {
	getAllCategories,
	addCategory,
	findSingleCategory,
};

export default CategoryControllers;
