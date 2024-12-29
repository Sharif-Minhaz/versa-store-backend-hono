import { JWTPayload } from "hono/utils/jwt/types";

export interface ThrowError extends Error {
	status: number;
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
