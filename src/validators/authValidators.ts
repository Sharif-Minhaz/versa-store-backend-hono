import { z } from "zod";

// registration validation
const validateUserReg = z
	.object({
		fullName: z
			.string()
			.trim()
			.min(3, { message: "Full Name should be at least 3-31 chars" })
			.max(31, { message: "Full Name should be at least 3-31 chars" }),
		email: z.string().trim().email({ message: "Invalid email address" }),
		password: z
			.string()
			.trim()
			.min(6, { message: "Password should be at least 6 characters long" })
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?:=&-])[A-Za-z\d@$!%*#?:=&-]+$/, {
				message:
					"Password should have at least 1 Uppercase, 1 Lowercase, 1 number, and 1 special character",
			}),
		registerFor: z.string().optional(),
		shopName: z
			.string()
			.trim()
			.nonempty({ message: "Shop name is required for vendors" })
			.optional(),
		shopLicenseNo: z
			.string()
			.trim()
			.nonempty({ message: "Shop license no. is required for vendors" })
			.optional(),
		shopType: z
			.string()
			.trim()
			.nonempty({ message: "Shop type is required for vendors" })
			.optional(),
		shopAddress: z
			.string()
			.trim()
			.nonempty({ message: "Shop address is required for vendors" })
			.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.registerFor === "vendor") {
			if (!data.shopName) {
				ctx.addIssue({
					code: "custom",
					path: ["shopName"],
					message: "Shop name is required for vendors",
				});
			}
			if (!data.shopLicenseNo) {
				ctx.addIssue({
					code: "custom",
					path: ["shopLicenseNo"],
					message: "Shop license no. is required for vendors",
				});
			}
			if (!data.shopType) {
				ctx.addIssue({
					code: "custom",
					path: ["shopType"],
					message: "Shop type is required for vendors",
				});
			}
			if (!data.shopAddress) {
				ctx.addIssue({
					code: "custom",
					path: ["shopAddress"],
					message: "Shop address is required for vendors",
				});
			}
		}
	});

const validateUserLogin = z.object({
	email: z
		.string()
		.trim()
		.nonempty({ message: "Email is required" })
		.email({ message: "Invalid email address" }),
	password: z.string().trim().nonempty({ message: "Password is required" }),
	loginFor: z.string().trim().nonempty({ message: "loginFor is required" }),
});

export { validateUserReg, validateUserLogin };
