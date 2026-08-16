import { Router } from "express";
import * as controller from "./cart.controller.js";

const router = Router();

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.add);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;