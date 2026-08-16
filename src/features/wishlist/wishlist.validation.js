import { httpError } from "../../common/error.js";
import { Product } from "../products/products.model.js";

const requireProductId = async (productId) => {
  if (
    typeof productId !== "string" ||
    !productId.trim()
  ) {
    throw httpError(400, "Valid productId required");
  }

  const product = await Product.findById(productId.trim());

  if (!product) {
    throw httpError(400, "Valid productId required");
  }

  return productId.trim();
};

export const validateProductId = async (body = {}) => {
  const { productId } = body;

  return {
    productId: await requireProductId(productId),
  };
};