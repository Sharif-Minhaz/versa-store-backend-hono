import Order from "../models/Order.model";
import Product from "../models/Product.model";
import ProductServices from "../services/product.services";
import PaymentServices from "../services/payment.services";
import { throwError } from "../utils";
import { Context } from "hono";
import { IOrderProduct } from "../types";

// create an order
const createOrder = async (ctx: Context) => {
	const user = ctx.get("user");
	const body = await ctx.req.json();
	const { orderMethod, products, deliveryCharge = 50 } = body;

	if (products?.length === 0) return throwError("No products found", 404);

	// retrieve all products promises
	const allProducts = products.map((item: IOrderProduct) => {
		return Product.findById(item.product).populate("category");
	});

	// resolve all promises
	const allProductsAvailable = await Promise.all(allProducts);

	// validate product' total price in the backend again
	const originalPrice = allProductsAvailable.reduce((prev, product) => {
		// find the associate count of the product
		const count = products?.find(
			(prod: IOrderProduct) => prod?.product === product?._id?.toString()
		).count;
		const discountPrice = (Number(product.price) * product.discount) / 100;
		return (product.price - discountPrice) * count + prev;
	}, 0);

	const orderedBy = user._id;
	const tranxId = crypto.randomUUID();

	const totalPrice = originalPrice + deliveryCharge;

	// create new order
	const newOrder = await Order.create({
		...body,
		products,
		totalPrice, // add delivery charge with the total price
		productPrice: originalPrice,
		orderedBy,
		tranxId,
		deliveryCharge,
	});

	if (newOrder) await ProductServices.updateProductStock(products, "DEC"); // decrement product from stock

	// fetch req to ssl-commerz to create session
	if (orderMethod === "online") {
		const paymentInfo = await PaymentServices.payment(
			{
				...body,
				productName: allProductsAvailable.map((product) => product).join(", "),
				totalPrice,
				tranxId,
				productCategory: "stuff",
			},
			user // pass logged in user too
		);

		// add the payment url
		await Order.findOneAndUpdate(newOrder._id, {
			paymentUrl: paymentInfo.url || null, // null if payment failed
			status: "pending",
		});

		return ctx.json({ url: paymentInfo.url || null, orderMethod: "online" }, 201);
	}
	return ctx.json(
		{
			success: true,
			message: "Order created",
			order: newOrder,
			orderMethod: "cash",
		},
		201
	);
};

// delete the order
const deleteOrder = async (ctx: Context) => {
	const orderId = ctx.req.param("orderId");

	if (!orderId) return throwError("Order id required", 400);

	// only unsuccess orders can be deleted
	const order = await Order.findOneAndDelete({ _id: orderId, status: { $ne: "success" } });

	if (!order) return throwError("Order not found to delete", 404);

	// restore the stock count to the original product
	await ProductServices.updateProductStock(order.products, "INC");

	return ctx.json({ success: true, message: "Order deleted successfully" }, 200);
};

// reject the order -> Admin only
const rejectOrder = async (ctx: Context) => {
	const orderId = ctx.req.param("orderId");

	if (!orderId) throwError("Order id required", 400);

	// orders rejection
	const order = await Order.findByIdAndUpdate(
		orderId,
		{ status: "rejected", note: "Not enough payment" },
		{ new: true }
	);

	if (!order) throwError("Order not found to reject", 404);

	// restore the stock count to the original product
	await ProductServices.updateProductStock(order.products, "INC");

	return ctx.json({ success: true, message: "Order rejected successfully" }, 200);
};

// accept the order -> Admin only
const acceptedOrder = async (ctx: Context) => {
	const orderId = ctx.req.param("orderId");

	if (!orderId) throwError("Order id required", 400);

	// orders rejection
	const order = await Order.findByIdAndUpdate(orderId, { status: "accepted" }, { new: true });

	if (!order) throwError("Order not found to accept", 404);

	return ctx.json({ success: true, message: "Order accepted successfully" }, 200);
};

// user specific orders
const findUserOrders = async (ctx: Context) => {
	const user = ctx.get("user");
	const orderedBy = user._id;

	if (!orderedBy) throwError("User id required", 400);

	// find orders
	const orders = await Order.find({ orderedBy })
		.populate({
			path: "products.product",
			select: "name description images price",
		})
		.populate("orderedBy")
		.lean();

	return ctx.json({ success: true, orders }, 200);
};

const getAllOrders = async (ctx: Context) => {
	const orders = await Order.find()
		.populate({
			path: "products.product",
			select: "name description images price",
		})
		.populate("orderedBy")
		.lean();

	return ctx.json({ success: true, orders }, 200);
};

const OrderControllers = {
	createOrder,
	deleteOrder,
	acceptedOrder,
	rejectOrder,
	findUserOrders,
	getAllOrders,
};

export default OrderControllers;
