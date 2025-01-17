import "./config.js";
import express from "express";
import cors from "cors";
import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhookRouter from "./routes/webhook.route.js";
import { clerkMiddleware } from "@clerk/express";


const app = express();

app.use(clerkMiddleware());

// Ensure essential environment variables are set
if (!process.env.MONGODB_URI || !process.env.CLERK_WEBHOOK_SECRET) {
  console.error("Essential environment variables are missing!");
  process.exit(1);
}

// app.get("/auth-state",(req, res)=>{
//   const authState = req.auth;
//   res.json(authState)
// });

// app.get("/protect",(req, res)=>{
//   const {userId} = req.auth;
//   if(!userId){
//     return res.status(401).json("not authenticated")
//   }
//   res.status(200).json("content")
// });

// app.get("/protect2", requireAuth(), (req, res)=>{
//   res.status(200).json("content")
// });

// Middleware for CORS
app.use(cors({ origin: process.env.CLIENT_URL }));

app.use("/webhooks", webhookRouter);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Backend is up and running!");
});


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});





// Routes
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong!",
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
});

// Start the server
const PORT = process.env.PORT || 6000;

app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
  }
});
