// "Perform the actual business logic"

import prisma from "../config/database.js";

const register = async (username, password) => {
  // Check whether username already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUser) {
    throw new Error("Username already exists");
  }

  // Create new user
  const user = await prisma.user.create({
    data: {
      username,
      password,
    },
  });

  // Don't send password back to frontend
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  };
};

const login = async (username, password) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    throw new Error("Invalid username or password");
  }

  // TEMPORARY:
  // We will replace this with bcrypt password comparison.
  if (user.password !== password) {
    throw new Error("Invalid username or password");
  }

  return {
    user: {
      id: user.id,
      username: user.username,
    },
  };
};

export default {
  register,
  login,
};
