import { Router } from "express";
import * as controller from "./wishlist.controller.js";
import { authenticate } from "../../common/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", controller.list);

router.get("/:id", controller.getById);

router.post("/", controller.add);

router.delete("/:id", controller.remove);

export default router;