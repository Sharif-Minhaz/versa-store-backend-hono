// FIXME: not going to work in the bun.js runtime, need to be shifted to a node.js runtime or environment

import { Context } from "hono";

import SSLCommerzPayment from "sslcommerz-lts";
import { secrets } from "../configs";

const initSSL_Commerz = async (ctx: Context) => {
	const body = await ctx.req.json();

	const {
		price,
		productName,
		customer_name,
		customer_email,
		customer_add = "Dhaka",
		customer_phone = "01300000000",
		customer_postcode = "1000",
		customer_country = "Bangladesh",
		product_category = "Stuff",
		tran_id,
	} = body;

	const data = {
		total_amount: Number(price),
		currency: "BDT",
		tran_id,
		success_url: `${process.env.SERVER_URL}/payment/success?tran_id=${tran_id}`,
		fail_url: `${process.env.SERVER_URL}/payment/fail?tran_id=${tran_id}`,
		cancel_url: `${process.env.SERVER_URL}/payment/cancel?tran_id=${tran_id}`,
		shipping_method: "No",
		product_name: productName,
		product_category: product_category,
		product_profile: "general",
		cus_name: customer_name,
		cus_email: customer_email,
		cus_add1: customer_add,
		cus_add2: customer_add,
		cus_city: customer_add,
		cus_state: customer_add,
		cus_postcode: customer_postcode,
		cus_country: customer_country,
		cus_phone: customer_phone,
		cus_fax: customer_phone,
		multi_card_name: "mastercard",
		value_a: "ref001_A",
		value_b: "ref002_B",
		value_c: "ref003_C",
		value_d: "ref004_D",
		ipn_url: `${process.env.SERVER_URL}/payment/notification`,
	};

	const sslcommerz = new SSLCommerzPayment(
		secrets.storeId!,
		secrets.storePassword!,
		false //true for live default false for sandbox
	);

	console.log(sslcommerz);

	// @ts-ignore
	sslcommerz.init(data).then((data: { GatewayPageURL: string }) => {
		console.log(data);
		// https://developer.sslcommerz.com/doc/v4/#returned-parameters
		if (data?.GatewayPageURL) {
			return ctx.json({ url: data.GatewayPageURL }, 200);
		}

		return ctx.json({ success: false, message: "Session was not successful" }, 400);
	});
};

const PaymentControllers = {
	initSSL_Commerz,
};

export default PaymentControllers;
