import bodyParser from "body-parser";
import express from "express";
import { clerkWebHook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/clerk", bodyParser.raw({ type: "application/json" }), clerkWebHook);
export default router;

