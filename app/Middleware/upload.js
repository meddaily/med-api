const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIA3FXLXZCM36DUCS3P",
    secretAccessKey: "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",
  },
});
const uploadToS3 = (req, res, next) => {
  const upload = multer({
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (allowedMimeTypes.includes(file.mimetype)) {
        // Allow the file to be uploaded
        cb(null, true);
      } else {
        // Reject the file
        cb(new Error("Invalid file format"));
      }
    },
    // storage: multerS3({
    //   s3: s3Client,
    //   bucket: "meddaily-files",
    //   key: (req, file, cb) => {
    //     cb(null, Date.now().toString() + "_" + file.originalname);
    //   },
    // }),
    storage: multer.diskStorage({})
  }).single("image");
  console.log(">>>>frist", req.files);
  return next();
  // upload(req, res, (error) => {
  //   if (error) {
  //     console.error("Error uploading file", error);
  //     return res
  //       .status(500)
  //       .json({ error: "Error uploading file" + "message: " + error.message });
  //   }
  //   console.log(">>>>third", req.body);

  //   return next();
  // });
};
const uploadToS3multiple = (req, res, next) => {
  const upload = multer({
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (allowedMimeTypes.includes(file.mimetype)) {
        // Allow the file to be uploaded
        cb(null, true);
      } else {
        // Reject the file
        cb(new Error("Invalid file format"));
      }
    },
    storage: multerS3({
      s3: s3Client,
      bucket: "meddaily-files",
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + "_" + file.originalname);
      },
    }),
  }).fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]);
  upload(req, res, (error) => {
    if (error) {
      console.error("Error uploading file", error);
      return res.status(500).json({ error: "Error uploading file" });
    }
    next();
  });
};
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination directory where uploaded files will be stored
    console.log('Files');
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Use the original filename for the uploaded file
    cb(null, file.originalname);
  },
});
const upload1 = multer({ storage: storage1 });
const streamedUpload = async (data) => {
  // Create an instance of the S3 service
  const uploadParams = {
    Bucket: "meddaily-files",
    Key: "INVOICE" + Date.now(),
    Body: data,
  };
  try {
    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);
    console.log("File uploaded successfully:", response.Location);
    return response.Location;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
// Define the Multer middleware function
const normaluploadMiddleware = upload1.single("file");
const bulkUpdateMulter = multer({storage: multer.diskStorage({})}).single('file')
module.exports = {
  streamedUpload: streamedUpload,
  uploadToS3: uploadToS3,
  uploadToS3multiple: uploadToS3multiple,
  normaluploadMiddleware: normaluploadMiddleware,
  bulkUpdateMulter: bulkUpdateMulter
};