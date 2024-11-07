import multer from "multer";
import path from "path";

const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   
    cb(null, './public/temp'); 
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error("Unsupported file type!"));
    }
  }
});
