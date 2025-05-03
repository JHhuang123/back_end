// models/Note.js
const mongoose = require("mongoose");
const userDb = require("../utils/userDb");

const NoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: "Notes"
});

const Note = userDb.model("Note", NoteSchema);
module.exports = Note;