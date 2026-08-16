import {
  db,
  newId,
  findById,
  removeById,
} from "../../common/store.js";

import { httpError } from "../../common/error.js";
import { Product } from "../products/products.model.js";


// MongoDB se product details attach karega
const withProduct = async (item) => {
  const product = await Product
    .findById(item.productId)
    .lean();

  return {
    ...item,
    product,
  };
};


// =========================
// LIST CART
// =========================

export const list = async () => {
  const items = await Promise.all(
    db.cart.map(withProduct)
  );

  const total = items.reduce(
    (sum, item) =>
      sum + (item.product?.price ?? 0) * item.qty,
    0
  );

  return {
    items,
    total,
  };
};


// =========================
// GET CART ITEM
// =========================

export const getById = async (id) => {
  const item = findById(db.cart, id);

  if (!item) {
    throw httpError(404, "Cart item not found");
  }

  return await withProduct(item);
};


// =========================
// ADD TO CART
// =========================

export const add = async ({ productId, qty }) => {
  const existing = db.cart.find(
    (item) => item.productId === productId
  );

  if (existing) {
    existing.qty += qty;

    return {
      item: await withProduct(existing),
      created: false,
    };
  }


  const item = {
    id: newId(),
    productId,
    qty,
  };

  db.cart.push(item);

  return {
    item: await withProduct(item),
    created: true,
  };
};


// =========================
// UPDATE CART
// =========================

export const update = (id, { qty }) => {
  const item = findById(db.cart, id);

  if (!item) {
    throw httpError(404, "Cart item not found");
  }

  item.qty = qty;

  return item;
};


// =========================
// REMOVE FROM CART
// =========================

export const remove = (id) => {
  const deleted = removeById(db.cart, id);

  if (!deleted) {
    throw httpError(404, "Cart item not found");
  }

  return deleted;
};