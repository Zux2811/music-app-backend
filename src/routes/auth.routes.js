import express from "express";
import { register, login } from "../controllers/auth.controller.js";
// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);

// export default router;

const router = express.Router();

router.post("/register", (req, res) => {
  const { email, password } = req.body;

  const hash = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hash],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User registered" });
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err || result.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = result[0];

      if (!bcrypt.compareSync(password, user.password))
        return res.status(400).json({ message: "Wrong password" });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ token });
    }
  );
});

module.exports = router;
