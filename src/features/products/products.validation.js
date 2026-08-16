import { httpError } from "../../common/error.js";

// ponytail: haath se likhi validation, zod tab jab schemas sach me complex ho jaayen
const isName = (v) => typeof v === "string" && v.trim().length > 0;
const isPrice = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0;
const isStock = (v) => Number.isInteger(v) && v >= 0;

export const validateCreate = (body = {}) => {
  const { name, price, stock = 0 } = body;
  if (!isName(name)) throw httpError(400, "name (non-empty string) required");
  if (!isPrice(price)) throw httpError(400, "price (number >= 0) required");
  if (!isStock(stock)) throw httpError(400, "stock must be an integer >= 0");
  return { name: name.trim(), price, stock };
};

// PUT me sirf wahi fields lete hain jo bheji gayi hain
export const validateUpdate = (body = {}) => {
  const { name, price, stock } = body;
  const patch = {};
  if (name !== undefined) {
    if (!isName(name)) throw httpError(400, "name (non-empty string) required");
    patch.name = name.trim();
  }
  if (price !== undefined) {
    if (!isPrice(price)) throw httpError(400, "price (number >= 0) required");
    patch.price = price;
  }
  if (stock !== undefined) {
    if (!isStock(stock)) throw httpError(400, "stock must be an integer >= 0");
    patch.stock = stock;
  }
  if (Object.keys(patch).length === 0)
    throw httpError(400, "name / price / stock me se kuch to bhejo");
  return patch;
};
