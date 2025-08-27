import express from "express";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

const router = express.Router();
let gfsBucket;

mongoose.connection.once("open", () => {
  const db = mongoose.connection.db;
  gfsBucket = new GridFSBucket(db, { bucketName: "uploads" });
  console.log("📂 GridFSBucket initialized...");
});

// GET file by filename
router.get("/:filename", async (req, res) => {
  try {
    if (!gfsBucket) return res.status(500).send("GridFS not initialized");

    const cursor = gfsBucket.find({ filename: req.params.filename });
    const files = await cursor.toArray();

    if (!files || files.length === 0) {
      return res.status(404).send("File not found");
    }

    const downloadStream = gfsBucket.openDownloadStreamByName(req.params.filename);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
