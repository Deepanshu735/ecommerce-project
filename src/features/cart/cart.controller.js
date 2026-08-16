import * as service from "./cart.service.js";
import * as validate from "./cart.validation.js";

export const list = async (req, res) => {
  res.json(await service.list());
};

export const getById = async (req, res) => {
  res.json(await service.getById(req.params.id));
};

export const add = async (req, res) => {
  const { item, created } = await service.add(
    await validate.validateAdd(req.body)
  );

  res
    .status(created ? 201 : 200)
    .json(item);
};

export const update = (req, res) => {
  const payload = validate.validateUpdate(req.body);

  res.json(
    service.update(req.params.id, payload)
  );
};

export const remove = (req, res) => {
  res.json({
    deleted: service.remove(req.params.id),
  });
};