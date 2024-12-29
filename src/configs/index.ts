export const secrets = {
	port: Bun.env.PORT || 9000,
	jwtExpiresIn: Math.floor(Date.now() / 1000) + 60 * +Bun.env.JWT_EXPIRES_IN!, // in minute, // in seconds
	secretKey: Bun.env.SECRET_KEY,
	mongodbUri: Bun.env.MONGODB_URI,
	refreshJwtExpiresIn: Math.floor(Date.now() / 1000) + 60 * +Bun.env.REFRESH_JWT_EXPIRES_IN!,
	refreshSecretKey: Bun.env.REFRESH_SECRET_KEY,
	cloudName: Bun.env.CLOUD_NAME,
	cloudinaryApiKey: Bun.env.CLOUDINARY_API_KEY,
	cloudinaryApiSecret: Bun.env.CLOUDINARY_API_SECRET,
	storeId: Bun.env.STORE_ID,
	storePassword: Bun.env.STORE_PASSWORD,
	clientUrl: Bun.env.CLIENT_URL,
	serverUrl: Bun.env.SERVER_URL,
	arcjetKey: Bun.env.ARCJET_KEY,
};
