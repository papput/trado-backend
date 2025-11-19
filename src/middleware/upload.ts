import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req:any, file:any, cb:any) => {
    cb(null, uploadDir);
  },
  filename: (req:any, file:any, cb:any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // limit: 2MB
  fileFilter: (req:any, file:any, cb:any) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});
