import Category from "../models/Category.model";
import Product from "../models/Product.model";
import Customer from "../models/Customer.model";
import ProductServices from "../services/product.services";
import { capitalize } from "../utils";
import { deleteImage } from "../utils/deleteImage";
import { throwError } from "../utils";
import { uploadImages } from "../utils/uploadImage";
import { Context } from "hono";
import { IProduct, IProductImage } from "../types";

const getAllProducts = async (ctx: Context) => {
	const { limit = "12", page = "1", category = "" } = ctx.req.query();

	// Convert limit and page to numbers
	const query: { limit: number; page: number; category: string } = {
		limit: parseInt(limit, 10),
		page: parseInt(page, 10),
		category,
	};

	if (limit) query.limit = parseInt(limit as string);
	if (page) query.page = parseInt(page as string);

	const data = await ProductServices.getAllProducts(query);

	return ctx.json({ success: true, data }, 200);
};

const singleProduct = async (ctx: Context) => {
	const productId = ctx.req.param("productId");

	if (!productId) throwError("Product id required", 400);

	// find product
	const product = await Product.findById(productId)
		.populate("addedBy")
		.populate({
			path: "category",
			select: "name image",
		})
		.lean();

	if (!product) throwError("Product not found", 404);

	return ctx.json({ success: true, product }, 200);
};

const addProduct = async (ctx: Context) => {
	const body = await ctx.req.parseBody({ dot: true });

	const { _id, user_type } = ctx.get("user");
	const images: File[] = ctx.get("images");

	if (!body?.category) return throwError("Category id required", 400);

	// find the category
	const categoryInfo = await Category.findById(body?.category).lean();

	if (!categoryInfo) return throwError("Category not found", 404);

	// parse variant info
	const parsedVariant = body?.variant && JSON.parse(body?.variant as string);

	if (!images?.length) return throwError("At least 1 product' image required", 400);

	// images uploading
	const shopImages = await uploadImages(images);

	const newProduct = await Product.create({
		...body,
		addedBy: _id,
		addedByModel: capitalize(user_type),
		variant: parsedVariant,
		images: shopImages.map((image) => ({ url: image.secure_url, publicId: image.public_id })),
	});

	return ctx.json({ success: true, product: newProduct }, 201);
};

// update product
const updateProduct = async (ctx: Context) => {
	const user = ctx.get("user");
	const body = await ctx.req.parseBody({ dot: true });
	const productId = ctx.req.param("productId");
	const images = ctx.get("images");

	if (!productId) return throwError("Product id required", 400);

	// find product
	let product: IProduct;
	if (user?.user_type === "vendor") {
		product = (await Product.findOne({ _id: productId, addedBy: user._id }).lean()) as IProduct;
	} else {
		product = (await Product.findById(productId).lean()) as IProduct;
	}

	if (!product) return throwError("Product not found", 404);

	// parse the variant information
	const parsedVariant = body?.variant && JSON.parse(body?.variant as string);

	// check if new images can be uploaded or not
	const isNewImageCapAvailable = product.images?.length + images?.length <= 5;

	let imageUploads;
	// checking if the images is exceeding the limit of images count (5)
	if (images?.length && isNewImageCapAvailable) {
		imageUploads = await uploadImages(images);
	} else if (!isNewImageCapAvailable) {
		return throwError(
			`Only total 5 images is accepted for a single product. Previous: ${product.images?.length} image/s & new uploads: ${images?.length} image/s`,
			409
		);
	}

	const newProductImages =
		imageUploads?.map((image) => ({
			url: image.secure_url,
			publicId: image.public_id,
		})) || [];

	const updateProductInfo = await Product.findByIdAndUpdate(
		productId,
		{
			...body,
			variant: parsedVariant,
			images: [...product.images, ...newProductImages],
		},
		{ new: true }
	);

	return ctx.json(
		{ success: true, message: "Product updated successfully", product: updateProductInfo },
		200
	);
};

// delete product
const deleteProduct = async (ctx: Context) => {
	const productId = ctx.req.param("productId");
	const user = ctx.get("user");

	if (!productId) return throwError("Product id not found", 404);

	// find the product
	let product;
	if (user?.user_type === "vendor") {
		product = await Product.findById({ _id: productId, addedBy: user?._id }).select("images");
	} else {
		product = await Product.findById(productId).select("images");
	}

	if (!product) return throwError("Product not found", 404);

	product.images.forEach((image: IProductImage) => {
		// delete all product images too
		deleteImage(image.publicId);
	});

	await Product.findByIdAndDelete(productId);

	return ctx.json({ success: true, message: `Product: ${productId} deleted successfully` }, 200);
};

// delete product image
const deleteProductImage = async (ctx: Context) => {
	const productId = ctx.req.param("productId");
	const imageId = ctx.req.param("imageId");

	if (!productId || !imageId) return throwError("Product id and image id both required");

	const deletedInfo = await ProductServices.deleteImageById(productId, imageId);

	return ctx.json({ success: true, product: deletedInfo }, 200);
};

// bookmark a product
const toggleBookmark = async (ctx: Context) => {
	const productId = ctx.req.param("productId");
	if (!productId) return throwError("Product id required", 400);

	const user = ctx.get("user");

	const { _id, user_type } = user;

	if (user_type !== "customer") return throwError("Bookmark feature is only for customers", 403);

	const isProductExist = await Product.exists({ _id: productId });
	if (!isProductExist) throwError("Product doesn't exist", 404);

	const customer = await Customer.findById(_id);

	// check if product is already bookmarked
	const isBookmarked = customer.bookmarks.includes(productId);

	// add to bookmarks if not already, remove if it is
	const update = isBookmarked
		? { $pull: { bookmarks: productId } } // remove from bookmark
		: { $addToSet: { bookmarks: productId } }; // add to bookmark

	await Customer.findByIdAndUpdate(_id, update);

	return ctx.json({
		success: true,
		bookmarked: !isBookmarked,
		message: `Product has been ${isBookmarked ? "removed from" : "added to"} bookmarks`,
	});
};

const getPopularProducts = async (ctx: Context) => {
	const products = await Product.find().sort({ sold: -1 }).populate("category addedBy");

	return ctx.json({ success: true, products }, 200);
};

const getVendorProducts = async (ctx: Context) => {
	const userId = ctx.req.param("userId");

	if (!userId) return throwError("Vendor id required", 400);

	const products = await Product.find({ addedBy: userId }).populate("category addedBy");

	return ctx.json({ success: true, products, id: userId }, 200);
};

const getSearchResults = async (ctx: Context) => {
	const term = ctx.req.query("term") || "";

	const products = await Product.find({ $text: { $search: term } }).select(
		"name description images _id price"
	);

	return ctx.json({ success: true, products }, 200);
};

const ProductControllers = {
	getAllProducts,
	singleProduct,
	addProduct,
	updateProduct,
	deleteProduct,
	deleteProductImage,
	toggleBookmark,
	getVendorProducts,
	getPopularProducts,
	getSearchResults,
};

export default ProductControllers;
