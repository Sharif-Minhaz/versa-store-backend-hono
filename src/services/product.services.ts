import Product from "../models/Product.model";
import { deleteImage } from "../utils/deleteImage";
import { throwError } from "../utils";
import { IOrderProduct, IProduct, IProductImage, IQuery } from "../types";

const getAllProducts = async (query: IQuery) => {
	const { limit = 12, page = 1, category } = query;

	const start = (page - 1) * limit;

	const products = await Product.find(category ? { category } : {})
		.skip(start)
		.limit(limit)
		.populate("addedBy")
		.populate({
			path: "category",
			select: "name image",
		})
		.lean();

	// Get the total count of products
	const totalProducts = await Product.countDocuments();

	return { total: totalProducts, page, limit, products };
};

const deleteImageById = async (productId: string, imageId: string) => {
	const targetedImageObj = await Product.findById(productId).select("images");

	if (!targetedImageObj) return throwError("Product not found", 404);

	if (targetedImageObj.images?.length <= 1)
		return throwError("Can't delete the only image, upload more to delete this image", 409);

	// filter out that specific image
	const imageInfo = targetedImageObj.images.filter(
		(image: IProductImage) => String(image._id) === imageId
	)[0];

	if (!imageInfo) throwError("Image not found", 404);

	const [product] = await Promise.all([
		Product.findOneAndUpdate(
			{ _id: productId },
			{ $pull: { images: { _id: imageId } } }, // Pull (remove) the image with the specified _id
			{ new: true }
		),
		deleteImage(imageInfo?.publicId), // delete the image from cloudinary
	]);

	if (!product) throwError("Error deleting image");

	return product;
};

// update product stock
const updateProductStock = async (products: IOrderProduct[], type: string) => {
	if (type === "INC") {
		// Increase product stock by count
		const productPromise = products.map((product) => {
			return Product.findByIdAndUpdate(
				product.product,
				{ $inc: { stock: product.count, sold: -product.count } },
				{ new: true }
			);
		});
		await Promise.all(productPromise);
	} else {
		// Decrease product stock by count
		const productPromise = products.map((product) => {
			return Product.findByIdAndUpdate(
				product.product,
				{ $inc: { stock: -product.count, sold: product.count } },
				{ new: true }
			);
		});

		await Promise.all(productPromise);
	}
};

const ProductServices = {
	getAllProducts,
	deleteImageById,
	updateProductStock,
};

export default ProductServices;
