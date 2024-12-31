declare module "sslcommerz-lts" {
	interface InitPaymentRequest {
		total_amount: number;
		currency: string;
		tran_id: string;
		success_url: string;
		fail_url: string;
		cancel_url: string;
		ipn_url?: string;
		product_category?: string;
		emi_option?: number;
		customer_name?: string;
		customer_email?: string;
		customer_address_1?: string;
		customer_address_2?: string;
		customer_city?: string;
		customer_state?: string;
		customer_postcode?: string;
		customer_country?: string;
		customer_phone?: string;
		customer_fax?: string;
		ship_name?: string;
		ship_address_1?: string;
		ship_address_2?: string;
		ship_city?: string;
		ship_state?: string;
		ship_postcode?: string;
		ship_country?: string;
		shipping_method?: string;
		num_of_item?: number;
		product_name?: string;
		product_profile?: string;
	}

	interface InitPaymentResponse {
		status: string;
		failedreason: string;
		sessionkey: string;
		GatewayPageURL: string;
		storeBanner: string;
		storeLogo: string;
		desc: string;
	}

	interface SSLCommerzPaymentConfig {
		store_id: string;
		store_passwd: string;
		isSandboxMode: boolean;
	}

	class SSLCommerzPayment {
		constructor(storeId: string, storePasswd: string, sandbox: boolean);
		init(data: InitPaymentRequest): Promise<{ status: string; data: InitPaymentResponse }>;
	}

	export default SSLCommerzPayment;
}
