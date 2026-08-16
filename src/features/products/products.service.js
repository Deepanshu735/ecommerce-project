import { db, newId, findById, removeById } from "../../common/store.js";
import { httpError } from "../../common/error.js";

export const list = () => db.products;

// safe lookup - cart/wishlist join ke liye, missing par undefined
export const find = (id) => findById(db.products, id);

export const getById = (id) => {
  const product = find(id);
  if (!product) throw httpError(404, "Product not found");
  return product;
};

export const create = (data) => {
  const product = { id: newId(), ...data };
  db.products.push(product);
  return product;
};

export const update = (id, patch) => Object.assign(getById(id), patch);

export const remove = (id) => {
  const deleted = removeById(db.products, id);
  if (!deleted) throw httpError(404, "Product not found");
  return deleted;
};
