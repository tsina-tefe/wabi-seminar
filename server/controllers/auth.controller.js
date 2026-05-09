import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sanitizeUser } from "../utils/user.js";
import * as userService from "../services/user.service.js";

export async function register(req, res) {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await userService.getUserByEmail(normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userService.createUser({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = jwt.sign(sanitizeUser(user), env.jwtSecret, { expiresIn: "7d" });
  return res.status(201).json({ token, user: sanitizeUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await userService.getUserByEmail(normalizedEmail);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(sanitizeUser(user), env.jwtSecret, { expiresIn: "7d" });
  return res.json({ token, user: sanitizeUser(user) });
}

export async function me(req, res) {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ user: sanitizeUser(user) });
}
