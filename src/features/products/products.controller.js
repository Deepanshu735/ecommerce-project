import * as service from "./products.service.js";
import * as validate from "./products.validation.js";
import mongoose from "mongoose";
import { Product } from "./products.model.js";
import { db } from "../../common/store.js";

export const list = async (req, res) => {
  try {
    // Pagination values
    const page =
      req.query.page === undefined
        ? 1
        : Number(req.query.page);

    const limit =
      req.query.limit === undefined
        ? 10
        : Number(req.query.limit);

    const offset =
      req.query.offset === undefined
        ? null
        : Number(req.query.offset);

    const cursor = req.query.cursor || null;

    // Page validation
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        error: "Page must be a positive integer",
      });
    }

    // Limit validation
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Limit must be an integer between 1 and 100",
      });
    }

    // Offset validation
    if (
      offset !== null &&
      (!Number.isInteger(offset) || offset < 0)
    ) {
      return res.status(400).json({
        error: "Offset must be a non-negative integer",
      });
    }

    // Cursor validation
    if (
      cursor !== null &&
      !mongoose.isValidObjectId(cursor)
    ) {
      return res.status(400).json({
        error: "Invalid cursor",
      });
    }

    // -----------------------------
    // Cursor / Page / Offset Query
    // -----------------------------

    let query = Product.find();

    // Cursor-based pagination
    if (cursor !== null) {
      query = query.find({
        _id: {
          $gt: cursor,
        },
      });
    }

    const products = await query
      .sort({ _id: 1 })
      .limit(limit)
      .skip(
        cursor !== null
          ? 0
          : offset !== null
            ? offset
            : (page - 1) * limit
      );

    const total = await Product.countDocuments();

    // Next cursor
    const nextCursor =
      products.length === limit
        ? products[products.length - 1]._id
        : null;

    res.json({
      data: products,

      // Page-based pagination
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },

      // Offset-based pagination
      offset:
        offset !== null
          ? {
              offset,
              limit,
              total,
              nextOffset:
                offset + limit < total
                  ? offset + limit
                  : null,
              previousOffset:
                offset > 0
                  ? Math.max(offset - limit, 0)
                  : null,
            }
          : null,

      // Cursor-based pagination
      cursor: {
  current: cursor,
  next: nextCursor,
},
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.json(product);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    // Extract payload
    const payload = validate.validateCreate(req.body);

    // Store into DB
    const dbResponse = await Product.create(payload);

    // Also mirror created product into in-memory store so cart/wishlist
    // services (which use the in-memory db) can resolve product details.
    try {
      db.products.push({
        id: String(dbResponse._id),
        name: dbResponse.name,
        price: dbResponse.price,
        stock: dbResponse.stock,
      });
    } catch (e) {
      // ignore mirroring errors
    }

    // Return response
    res.json(dbResponse);
 } catch (error) {
  res.status(error.status || 500).json({
    error: error.message,
  });
}
};

export const update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      validate.validateUpdate(req.body),
      {
        new: true,
      }
    );

    res.json(product);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    res.json({
      deleted: product,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};