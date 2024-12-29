import cloudinary from "../utils/cloudinaryInit";
import { throwError } from ".";

export const deleteImage = async (public_id: string) => {
	if (!public_id) throwError("Public id required", 400);

	await cloudinary.uploader.destroy(public_id);
};
