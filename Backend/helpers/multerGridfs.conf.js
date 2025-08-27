import multer from "multer";
import { GridFsStorage } from "@lenne.tech/multer-gridfs-storage";
import mongoose from "mongoose";

let gfsBucket;

const storage = new GridFsStorage({
  db: mongoose.connection,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
    };
  },
});

const upload = multer({ storage });

mongoose.connection.once("open", () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
  console.log("✅ GridFS Bucket initialized");
});

export { upload, gfsBucket };
