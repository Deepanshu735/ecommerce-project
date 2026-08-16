import * as service from "./wishlist.service.js";
import * as validate from "./wishlist.validation.js";


// =========================
// LIST WISHLIST
// =========================

export const list = async (req, res) => {
  res.json(await service.list());
};


// =========================
// GET WISHLIST ITEM
// =========================

export const getById = async (req, res) => {
  res.json(await service.getById(req.params.id));
};


// =========================
// ADD TO WISHLIST
// =========================

export const add = async (req, res) => {
  const payload = await validate.validateProductId(req.body);

  const { item, created } = await service.add(payload);

  res
    .status(created ? 201 : 200)
    .json(item);
};


// =========================
// REMOVE FROM WISHLIST
// =========================

export const remove = (req, res) => {
  res.json({
    deleted: service.remove(req.params.id),
  });
};