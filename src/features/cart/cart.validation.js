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


const requireQty = (qty) => {
  if (!Number.isInteger(qty) || qty < 1) {
    throw httpError(
      400,
      "qty must be a positive integer"
    );
  }

  return qty;
};


export const validateAdd = async (body = {}) => {
  const { productId, qty = 1 } = body;

  return {
    productId: await requireProductId(productId),
    qty: requireQty(qty),
  };
};


export const validateUpdate = (body = {}) => {
  return {
    qty: requireQty(body.qty),
  };
};