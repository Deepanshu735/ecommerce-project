import * as validate from "./auth.validation.js";
import { db } from "../../common/store.js";
import { generateToken } from "../../common/auth.js";
import { httpError } from "../../common/error.js";

export const register = (req, res) => {
  const { email, password } = validate.validateRegister(req.body);

  const existingUser = db.users.find(
    (user) => user.email === email
  );

  if (existingUser) {
    throw httpError(409, "User already exists");
  }

  const user = {
    id: String(Date.now()),
    email,
    password,
  };

  db.users.push(user);

  const token = generateToken(user);

  res.status(201).json({
    message: "User registered successfully",
    token,
  });
};

export const login = (req, res) => {
  const { email, password } = validate.validateLogin(req.body);

  const user = db.users.find(
    (item) =>
      item.email === email &&
      item.password === password
  );

  if (!user) {
    throw httpError(401, "Invalid email or password");
  }

  const token = generateToken(user);

  res.json({
    message: "Login successful",
    token,
  });
};