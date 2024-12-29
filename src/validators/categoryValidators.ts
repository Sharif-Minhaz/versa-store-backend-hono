import { z } from "zod";

const validateCategory = z.object({
	name: z.string().trim().min(3, "Category name should be at least 3 characters long."),
});

export default validateCategory;
