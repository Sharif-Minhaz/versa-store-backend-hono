import { Context } from "hono";
import Order from "../models/Order.model";
import { IOrder, IUser } from "../types";
import ProductServices from "./product.services";

const payment = async (
	orderInfo: IOrder & { productName: string; productCategory: string },
	user: IUser
) => {
	const {
		orderName,
		totalPrice,
		division,
		district,
		subDistrict,
		phoneNumber,
		productName,
		houseNo,
		tranxId,
		productCategory,
		postCode,
	} = orderInfo;

	const paymentData = {
		price: totalPrice,
		productName,
		customer_name: orderName || user.fullName,
		customer_email: user.email,
		customer_add: `${division}, ${district}, ${subDistrict}, House No: ${houseNo}`,
		customer_phone: phoneNumber,
		customer_postcode: postCode?.toString(),
		customer_country: "Bangladesh",
		product_category: productCategory,
		tran_id: tranxId,
	};

	const resultBuffer = await fetch(`${process.env.SERVER_URL}/payment/ssl-request`, {
		method: "POST",
		body: JSON.stringify(paymentData),
		headers: {
			"Content-Type": "application/json",
		},
	});

	const result = await resultBuffer.json();

	return result;
};

// cancel and order
const cancelPayment = async (ctx: Context) => {
	const tran_id = ctx.req.query("tran_id");

	const orderInfo = await Order.findOneAndUpdate(
		{ tranxId: tran_id },
		{ status: "cancelled" },
		{ new: true }
	);

	// update product stock
	await ProductServices.updateProductStock(orderInfo.products, "INC");
	return ctx.redirect(`${process.env.CLIENT_URL}/`, 301);
};

// payment success
const successPayment = async (ctx: Context) => {
	const tran_id = ctx.req.query("tran_id");
	await Order.findOneAndUpdate({ tranxId: tran_id }, { status: "accepted" }, { new: true });

	return ctx.redirect(`${process.env.CLIENT_URL}/`, 301);
};

// fail payment
const failPayment = async (ctx: Context) => {
	const tran_id = ctx.req.query("tran_id");
	const orderInfo = await Order.findOneAndUpdate(
		{ tranxId: tran_id },
		{ status: "failed" },
		{ new: true }
	);
	// update product stock
	await ProductServices.updateProductStock(orderInfo.products, "INC");

	return ctx.redirect(`${process.env.CLIENT_URL}/`, 301);
};

const PaymentServices = {
	payment,
	cancelPayment,
	successPayment,
	failPayment,
};

export default PaymentServices;
