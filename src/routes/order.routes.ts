import { Hono } from "hono";

import { catchAsync } from "../utils";
import OrderControllers from "../controllers/order.controllers";
import { checkAuth, checkAdmin } from "../middlewares/auth.middlewares";

const router = new Hono();

router.post("/", catchAsync(checkAuth), catchAsync(OrderControllers.createOrder));

router.delete("/:orderId", catchAsync(checkAuth), catchAsync(OrderControllers.deleteOrder));

router.patch(
	"/reject/:orderId",
	catchAsync(checkAuth),
	catchAsync(checkAdmin),
	catchAsync(OrderControllers.rejectOrder)
);
router.patch(
	"/accept/:orderId",
	catchAsync(checkAuth),
	catchAsync(checkAdmin),
	catchAsync(OrderControllers.acceptedOrder)
);

router.get("/orders", catchAsync(checkAuth), catchAsync(OrderControllers.findUserOrders));

router.get(
	"/all-orders",
	catchAsync(checkAuth),
	catchAsync(checkAdmin),
	catchAsync(OrderControllers.getAllOrders)
);

export default router;
