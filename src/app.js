import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import productsRouter from "./features/products/products.router.js";
import cartRouter from "./features/cart/cart.router.js";
import wishlistRouter from "./features/wishlist/wishlist.router.js";
import authRouter from "./features/auth/auth.router.js";
import { notFound, errorHandler } from "./common/error.js";
import { apiLimiter } from "./common/rateLimit.js";
import filesRouter from "./features/files/files.router.js";

const app = express();


app.use(express.json());
app.use(cors());
app.use(apiLimiter);


// Connecting mongodb with mongoose
mongoose
  .connect("mongodb://127.0.0.1:27017/flip-commerce")
  .then(() => console.log("MongoDB connected: flip-commerce database"));

app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/wishlist", wishlistRouter);
app.use("/auth", authRouter);
app.use("/files", filesRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
