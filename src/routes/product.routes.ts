import { Hono } from "hono";
import ProductControllers from "../controllers/product.controllers";
import { catchAsync } from "../utils";
import { checkAuth, checkAdminVendor } from "../middlewares/auth.middlewares";
import upload from "../middlewares/upload";
import { zValidator } from "@hono/zod-validator";
import validateProductSchema from "../validators/productValidators";

const router = new Hono();

router.get("/", catchAsync(ProductControllers.getAllProducts));
router.get("/search", catchAsync(ProductControllers.getSearchResults));
router.get("/single/:productId", catchAsync(ProductControllers.singleProduct));
router.post(
	"/",
	catchAsync(checkAuth),
	catchAsync(upload("images", true)),
	catchAsync(checkAdminVendor),
	zValidator("form", validateProductSchema),
	catchAsync(ProductControllers.addProduct)
);

router.patch(
	"/:productId",
	catchAsync(checkAuth),
	catchAsync(upload("images", true)),
	catchAsync(checkAdminVendor),
	// validateProduct,
	// catchAsync(runValidation), TODO: in testing it will cause a problem with postman records, cause the validation will required all the field's value, either the updated or not, but postman only providing only the field's value which  we want to update. so this line should be uncomment if publish to production.
	catchAsync(ProductControllers.updateProduct)
);
router.delete(
	"/:productId",
	catchAsync(checkAuth),
	catchAsync(checkAdminVendor),
	catchAsync(ProductControllers.deleteProduct)
);
router.delete(
	"/:productId/images/:imageId",
	catchAsync(checkAuth),
	catchAsync(checkAdminVendor),
	catchAsync(ProductControllers.deleteProductImage)
);

// popular product
router.get("/popular", catchAsync(ProductControllers.getPopularProducts));

router.get("/vendor/:userId", catchAsync(ProductControllers.getVendorProducts));

// product bookmark
router.patch(
	"/bookmark/:productId",
	catchAsync(checkAuth),
	catchAsync(ProductControllers.toggleBookmark)
);

export default router;
