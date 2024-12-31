// productValidation.js
import { z } from "zod";

export const validateProductSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, "Product name should be at least 3 characters long.")
		.nonempty("Product name is required."),
	description: z
		.string()
		.trim()
		.min(10, "Product description should be at least 10 characters long.")
		.nonempty("Product description is required."),
	price: z
		.string()
		.transform((val) => {
			const num = parseFloat(val);
			if (isNaN(num)) throw new Error("Product price must be a number.");
			return num;
		})
		.refine((val) => val >= 0, {
			message: "Product price must be a number greater than or equal to 0.",
		}),

	discount: z
		.string()
		.optional()
		.transform((val) => (val !== undefined ? parseFloat(val) : undefined))
		.refine((val) => val === undefined || (val >= 0 && val <= 100), {
			message: "Discount must be a number between 0 and 100.",
		}),

	stock: z
		.string()
		.transform((val) => {
			const num = parseInt(val, 10);
			if (isNaN(num)) throw new Error("Product stock must be a number.");
			return num;
		})
		.refine((val) => Number.isInteger(val) && val >= 0, {
			message: "Product stock must be a non-negative integer.",
		}),
	brand: z
		.string()
		.trim()
		.min(1, "Product brand name should be at least 1 character long.")
		.nonempty("Product brand name is required."),
	variant: z.string().trim().optional(),
	category: z.string().trim().nonempty("Product category is required."),
	defaultType: z.string().trim().optional(),
});

export default validateProductSchema;
