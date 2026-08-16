import { Router } from "express";
import * as controller from "./products.controller.js";
import { authenticate } from "../../common/auth.js";

const router = Router();

router.get("/", controller.list);
router.get("/:id", controller.getById);

router.post("/", authenticate, controller.create);
router.put("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, controller.remove);

export default router;