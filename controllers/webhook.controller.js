import { Webhook } from "svix";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

// Define the webhook handler
export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return res.status(400).json({ message: "Webhook secret missing!" });
  }

  const payload = req.body;
  const headers = req.headers;

  // Initialize the Webhook handler from the svix library
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    // Verify the webhook with the payload and signature
    evt = wh.verify(payload, headers);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({
      message: "Webhook verification failed!",
    });
  }

  // Handle the user.created event
  if (evt.type === "user.created") {
    const newUser = new User({
      clerkUserId: evt.data.id,
      username: evt.data.username || evt.data.email_addresses[0].email_address,
      email: evt.data.email_addresses[0].email_address,
      img: evt.data.profile_img_url,
    });

    await newUser.save();
  }

  if (evt.type === "user.deleted") {
    const deletedUser = await User.findOneAndDelete({
      clerkUserId: evt.data.id,
    });

    if (deletedUser) {
      // Delete related posts and comments if the user exists
      await Post.deleteMany({ user: deletedUser._id });
      await Comment.deleteMany({ user: deletedUser._id });
    } else {
      console.warn(`No user found with clerkUserId: ${evt.data.id}`);
    }
  }

  return res.status(200).json({
    message: "Webhook received",
  });
};
