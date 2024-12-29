import { v2 as cloudinary } from "cloudinary";
import { secrets } from "../configs";

cloudinary.config({
	cloud_name: secrets.cloudName,
	api_key: secrets.cloudinaryApiKey,
	api_secret: secrets.cloudinaryApiSecret,
});

export default cloudinary;
