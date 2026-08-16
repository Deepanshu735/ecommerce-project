import { httpError } from "../../common/error.js";

export const validateRegister = (body = {}) => {
  const { email, password } = body;

  if (!email || typeof email !== "string") {
    throw httpError(400, "Valid email is required");
  }

  if (!password || typeof password !== "string") {
    throw httpError(400, "Password is required");
  }

  if (password.length < 6) {
    throw httpError(
      400,
      "Password must be at least 6 characters"
    );
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
};

export const validateLogin = (body = {}) => {
  const { email, password } = body;

  if (!email || typeof email !== "string") {
    throw httpError(400, "Valid email is required");
  }

  if (!password || typeof password !== "string") {
    throw httpError(400, "Password is required");
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
};