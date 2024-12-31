import { Hono } from "hono";

import PaymentControllers from "../controllers/payment.controllers";
import PaymentServices from "../services/payment.services";
import { catchAsync } from "../utils";

const router = new Hono();

// TODO: need to protect those route, // have to set the auth header manually
// problem -> req is coming from direct server, so the authorization header is not passing,
// so cannot use the checkAuth middleware here

router.post("/ssl-request", catchAsync(PaymentControllers.initSSL_Commerz));
router.post("/success", catchAsync(PaymentServices.successPayment));
router.post("/fail", catchAsync(PaymentServices.failPayment));
router.post("/cancel", catchAsync(PaymentServices.cancelPayment));

export default router;
