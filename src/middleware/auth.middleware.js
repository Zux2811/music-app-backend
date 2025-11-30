import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  console.log("[AUTH_MIDDLEWARE] Checking authorization for:", req.method, req.path);
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    console.warn("[AUTH_MIDDLEWARE] No token provided");
    return res.status(401).json({ message: "No token" });
  }

  try {
    console.log("[AUTH_MIDDLEWARE] Verifying JWT token");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[AUTH_MIDDLEWARE] Token verified for user:", { id: payload.id, email: payload.email, role: payload.role });
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    console.error("[AUTH_MIDDLEWARE] Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
}
