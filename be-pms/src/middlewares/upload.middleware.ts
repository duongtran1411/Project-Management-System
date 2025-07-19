import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filter để chỉ cho phép image và video
const fileFilter = (req: any, file: any, cb: any) => {
  // Cho phép image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  }
  // Cho phép video
  else if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  }
  // Từ chối các file khác
  else {
    cb(new Error("Chỉ cho phép upload image và video!"), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  },
});

// Middleware để xử lý array fields trong multipart/form-data
const processArrayFields = (req: any, res: any, next: any) => {
  // Xử lý mentions array
  if (req.body.mentions) {
    if (Array.isArray(req.body.mentions)) {
      // Nếu đã là array thì giữ nguyên
    } else if (typeof req.body.mentions === "string") {
      // Nếu là string, thử parse JSON
      try {
        const parsed = JSON.parse(req.body.mentions);
        req.body.mentions = Array.isArray(parsed)
          ? parsed
          : [req.body.mentions];
      } catch {
        // Nếu không parse được, coi như single value
        req.body.mentions = [req.body.mentions];
      }
    }
  }

  next();
};

// Middleware để upload nhiều file
export const uploadFiles = [upload.array("files", 5), processArrayFields]; // Tối đa 5 file

// Middleware để upload 1 file
export const uploadSingleFile = upload.single("file");

export default upload;
