import { JWTPayload } from "hono/utils/jwt/types";

export interface ThrowError extends Error {
	status: number;
}

export interface IQuery {
	page?: number;
	limit?: number;
	category?: string;
}

export interface ITokenPayloadUser extends JWTPayload {
	_id: string;
	fullName: string;
	email: string;
	user_type: string;
	image: string;
}

export interface IUser {
	_id: string;
	fullName: string;
	email: string;
	password: string;
	image: string;
	shopName?: string;
	shopLicenseNo?: string;
	shopType?: string;
	shopPhoto?: string;
	shopAddress?: string;
	shopPhotoKey?: string;
	isBan: boolean;
	user_type: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ICategory {
	_id: string;
	name: string;
	image: string;
	imageKey: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IProductImage {
	_id: string;
	url: string;
	publicId: string;
}

export interface IProduct {
	_id: string;
	addedBy: IUser;
	category: ICategory;
	name: string;
	description: string;
	price: number;
	discount: number;
	brand: string;
	images: IProductImage[];
	imageKey: string;
	stock: number;
	sold: number;
	defaultType: string;
	variant: { [key: string]: string };
	deliveryCharge: number;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}

export interface IOrderProduct {
	_id: string;
	product: IProduct;
	count: number;
}

export interface IOrder {
	_id: string;
	products: IOrderProduct[];
	orderedBy: IUser;
	orderName: string;
	orderMethod: string;
	deliveryCharge: number;
	productPrice: number;
	totalPrice: number;
	division: string;
	district: string;
	subDistrict: string;
	postCode: string;
	phoneNumber: string;
	houseNo: string;
	status: "pending" | "declined" | "cart" | "accepted" | "cancelled" | "failed";
	tranxId: string;
	paymentUrl: string;
	note: string;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}
