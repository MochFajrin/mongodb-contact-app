import mongoose from "mongoose";

export function startServer() {
  mongoose.connect("mongodb://127.0.0.1:27017/contacts");
}
