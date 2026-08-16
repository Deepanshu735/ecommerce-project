import {
  db,
  newId,
  findById,
  removeById,
} from "../../common/store.js";

import { httpError } from "../../common/error.js";
import { Product } from "../products/products.model.js";


// =========================
// ADD PRODUCT DETAILS
// =========================

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
// LIST WISHLIST
// =========================

export const list = async () => {
  const items = await Promise.all(
    db.wishlist.map(withProduct)
  );

  return items;
};


// =========================
// GET WISHLIST ITEM
// =========================

export const getById = async (id) => {
  const item = findById(db.wishlist, id);

  if (!item) {
    throw httpError(404, "Wishlist item not found");
  }

  return await withProduct(item);
};


// =========================
// ADD TO WISHLIST
// =========================

export const add = async ({ productId }) => {
  const existing = db.wishlist.find(
    (item) => item.productId === productId
  );

  if (existing) {
    return {
      item: await withProduct(existing),
      created: false,
    };
  }

  const item = {
    id: newId(),
    productId,
  };

  db.wishlist.push(item);

  return {
    item: await withProduct(item),
    created: true,
  };
};


// =========================
// REMOVE FROM WISHLIST
// =========================

export const remove = (id) => {
  const deleted = removeById(db.wishlist, id);

  if (!deleted) {
    throw httpError(404, "Wishlist item not found");
  }

  return deleted;
};