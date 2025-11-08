// src/lib/dbConnect.js
import mongoose from "mongoose";
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) throw new Error("Please set MONGODB_URI in .env.local");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false, family: 4, dbName: "family-tree-db" };
    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
