import express from "express";
import verifyToken from "../middleware/auth.middleware.js";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favorite.controller.js";

const router = express.Router();

router.get("/", verifyToken, getFavorites);
router.post("/", verifyToken, addFavorite);
router.delete("/:songId", verifyToken, removeFavorite);

export default router;

