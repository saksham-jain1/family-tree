// src/models/Tree.js
import mongoose from "mongoose";

const TreeSchema = new mongoose.Schema({
  treeId: { type: String, required: true, unique: true },
  ownerUid: { type: String, required: true },
  ownerEmail: { type: String },
  treeData: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TreeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Tree || mongoose.model("Tree", TreeSchema);
