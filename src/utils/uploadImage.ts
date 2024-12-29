import cloudinary from "./cloudinaryInit";
import { Readable } from "stream";

interface IFile extends File {
	path: string;
}
async function uploadImageHandler(
	file: File,
	destination = "versaShopHono"
): Promise<{ secure_url: string; public_id: string }> {
	if (!file) {
		throw new Error("No file provided");
	}

	// Convert the file to a Buffer
	const buffer = await file.arrayBuffer();

	// Create a readable stream from the buffer
	const readable = Readable.from(Buffer.from(buffer));

	// Return a Promise to handle async upload
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{ folder: destination },
			(error, result) => {
				if (error) {
					reject(new Error(`Image upload failed: ${error.message}`));
				} else {
					resolve({ secure_url: result?.secure_url!, public_id: result?.public_id! });
				}
			}
		);

		// Pipe the readable stream into the Cloudinary upload stream
		readable.pipe(uploadStream);
	});
}

const uploadImages = async (files: IFile[]) => {
	return await Promise.all(
		files.map((file) => {
			const uploadResult = uploadImageHandler(file);
			return uploadResult;
		})
	);
};

export { uploadImageHandler, uploadImages };
