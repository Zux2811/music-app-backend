import jwt from "jsonwebtoken";

export function createJwt(user) {
  if (!user) throw new Error("createJwt requires a user object");
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

