require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { authenticateToken } = require("./utilities");
const User = require("./models/user.model");
const Note = require("./models/note.model");

mongoose
  .connect(config.connectionString)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName)
    return res
      .status(400)
      .json({ error: true, message: "Full Name is Required" });
  if (!email)
    return res.status(400).json({ error: true, message: "Email is Required" });
  if (!password)
    return res
      .status(400)
      .json({ error: true, message: "Password is Required" });

  const isUser = await User.findOne({ email: email });
  if (isUser) return res.json({ error: true, message: "User Already Exist" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ fullName, email, password: hashedPassword });

  await user.save();
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "3600m" }
  );

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successful",
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    const userInfo = await User.findOne({ email: email });
    if (!userInfo) return res.status(400).json({ message: "User Not Found" });

    const isPasswordMatch = await bcrypt.compare(password, userInfo.password);
    if (isPasswordMatch) {
      const user = { userId: userInfo._id, email: userInfo.email };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3600m",
      });

      return res.json({
        error: false,
        message: "Login Successful",
        email,
        accessToken,
      });
    } else {
      return res
        .status(400)
        .json({ error: true, message: "Invalid Credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

//Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const isUser = await User.findOne({ _id: userId });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdOn: isUser.createdOn,
    },
    message: "",
  });
});

// Add Notes
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const user = req.user;

  if (!title)
    return res.status(400).json({ error: true, message: "Title is required" });
  if (!content)
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user.userId,
    });

    await note.save();
    return res.json({ error: false, note, message: "Note Added Successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

//Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const userId = req.user.userId;

  if (!title && !content && !tags && isPinned === undefined) {
    return res
      .status(400)
      .json({ error: true, message: "No Changes Provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: userId });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not Found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Get All Notes
app.get("/get-all-notes/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const notes = await Note.find({ userId: userId }).sort({ isPinned: -1 });
    return res.json({
      error: false,
      notes,
      message: "All Notes Retrieved Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Delete Notes
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: userId });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not Found",
      });
    }

    await Note.deleteOne({ _id: noteId, userId: userId });

    return res.json({
      error: false,
      message: "Note Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Update isPinned Value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: userId });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not Found" });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Search Notes
app.get("/search-notes/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: true,
      message: "Search Query is Required",
    });
  }

  try {
    const matchingNotes = await Note.find({
      userId: userId,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes Matching the Search Query is Retrived Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.listen(port);

module.exports = app;
