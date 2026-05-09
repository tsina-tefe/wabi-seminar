import { randomUUID } from "crypto";
import { User } from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import { sanitizeUser } from "../utils/user.js";

const memoryByEmail = new Map();
const memoryById = new Map();

async function getUserByEmailMongo(email) {
  return User.findOne({ email });
}

async function getUserByIdMongo(id) {
  return User.findById(id);
}

export async function getUserByEmail(email) {
  if (isDatabaseConnected()) {
    return getUserByEmailMongo(email);
  }
  return memoryByEmail.get(email) || null;
}

export async function getUserById(id) {
  if (isDatabaseConnected()) {
    return getUserByIdMongo(id);
  }
  return memoryById.get(id) || null;
}

export async function createUser({ name, email, passwordHash }) {
  if (isDatabaseConnected()) {
    return User.create({ name, email, passwordHash });
  }

  const user = {
    id: randomUUID(),
    name,
    email,
    passwordHash,
  };
  memoryByEmail.set(email, user);
  memoryById.set(user.id, sanitizeUser(user));
  return user;
}
