const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dir = 'public/images/products';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}



// Define storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/products'); 
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

// File filter (optional: only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

console.log("Upload middleware initialized with storage at:", upload);

module.exports = upload;
