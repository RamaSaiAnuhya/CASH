import prisma from "../config/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const register = async (username, email, password) => {
  // Check if username or email already exists
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existingUser) throw new Error("Username or email already exists");

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });

  return { id: user.id, username: user.username, email: user.email };
};

const login = async (username, password) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error("Invalid username or password");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid username or password");

  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
};

export default { register, login };
