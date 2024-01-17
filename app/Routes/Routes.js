const { Router } = require("express");
// const upload = require("multer")();
module.exports = (route) => {
  const auth = require("../Middleware/Auth.js");
  const uploadController = require("../Controller/uploadController");
  const userimage = require("../Common/imageUpload.js");
  const RetailerController = require("../Controller/RetailerController.js");
  const DistributorController = require("../Controller/DistributorController.js");
  const ProductController = require("../Controller/ProductController.js");
  const upload = require("../Middleware/upload");

// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Specify the destination directory where uploaded files will be stored locally
//     cb(null, "local-path/");
//   },
//   filename: function (req, file, cb) {
//     // Use the original filename for the uploaded file
//     cb(null, Date.now().toString() + "_" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     // Allow the file to be uploaded
//     cb(null, true);
//   } else {
//     // Reject the file
//     cb(new Error("Invalid file format"));
//   }
// };

// const uploadRetailerImages = multer({
//   fileFilter: fileFilter,
//   storage: storage,
// }).fields([
//   { name: "RetailerDrugLicenseImage", maxCount: 1 },
//   { name: "RetailerGSTCertificateImage", maxCount: 1 },
// ]);
  // retailer routes
  route.post("/retailer_login", RetailerController.retailer_login);
  route.post(
    "/retailer_register",
    RetailerController.retailer_register
  );

  route.get("/retailer_profile", auth, RetailerController.retailer_profile);
  route.post(
    "/retailer_update",
    auth,
    // userimage.upload.array("image"),
    RetailerController.retailer_update
  );
  route.delete("/retailer_delete", auth, RetailerController.retailer_delete);
  route.post("/payment_init", auth, RetailerController.payment_init);
  route.post('/paymentStatus/:mtransactioId', RetailerController.paymentStatus)

  // distributor routes
  route.post("/distributor_login", DistributorController.distributor_login);

  route.post(
    "/distributor_register",
    // upload.uploadToS3multiple,
    DistributorController.distributor_register
  );

  route.post( 
    "/distributor_update",
    auth,
    DistributorController.distributor_update
  );
  route.get(
    "/distributor_profile",
    auth,
    DistributorController.distributor_profile
  );
  route.delete(
    "/distributor_delete",
    auth,
    DistributorController.distributor_delete
  );
  route.post("/update_inventory", auth, ProductController.update_inventory);
  route.post("/create_invoice", auth, DistributorController.create_invoice);
  route.get("/my_inventory", auth, DistributorController.my_inventory);
  route.get("/get_demo_file", DistributorController.getDemofile);
  route.post(
    "/bulk_update",
    auth,
    upload.bulkUpdateMulter,
    DistributorController.bulkUpdate
  );


  // retailer api home
  route.get("/retailer_home", auth, RetailerController.retailer_home);
  route.post("/category_product", auth, RetailerController.category_product);
  route.get("/get_product", auth, RetailerController.get_product);
  route.post("/product_details", auth, RetailerController.product_details);

  // retailer cart
  route.post("/add_to_cart", auth, RetailerController.add_to_cart);
  route.get("/get_cart", auth, RetailerController.get_cart);
  route.post("/update_cart", auth, RetailerController.update_cart);
  route.delete("/delete_cart", auth, RetailerController.delete_cart);

  // checkout
  route.get("/my_order", auth, RetailerController.my_order);
  route.get("/order_details", auth, RetailerController.order_details);
  route.post("/checkout", auth,  RetailerController.checkout);
  route.post(
    "/return_order",
    auth,
    // upload.uploadToS3,
    RetailerController.return_order
  );
  route.get("/get_all_return", auth, RetailerController.get_return);

  // distributor api
  route.get(
    "/distributor_get_product",
    auth,
    DistributorController.distributor_get_product
  );
  route.get(
    "/distributor_order",
    auth,
    DistributorController.distributor_order
  );
  route.post(
    "/return_order_accept",
    auth,
    DistributorController.return_order_accept
  );
  route.post(
    "/return_order_reject",
    auth,
    DistributorController.return_order_reject
  );
  route.post("/create_payout", auth, DistributorController.create_payout);

  //logout api

  route.get("/logout", auth, RetailerController.logout);
  route.post("/uploadfiles", upload.uploadToS3, uploadController.uploadFiles);
  route.get("/product_search", DistributorController.product_search);
  route.post("/request_product", auth, ProductController.request_product);
  route.get("/all_payout_request_distributor/:id", auth, DistributorController.all_payout_request);
  // admin.get("/all_payout_request/:id", AdminController.all_payout_request);
  route.get(
    "/get_request_product",
    auth,
    ProductController.get_request_product
  );
  route.get("/get_invoice", DistributorController.get_invoice);
  route.get("/get_summary", DistributorController.get_summary);
  route.get(
    "/get_payout_amount",
    auth,
    DistributorController.get_pending_payout
  );
  route.get(
    "/search_distributor_list",
    auth,
    DistributorController.search_distributor_list
  );
  route.get(
    "/distributor_get_product_retailer",
    auth,
    DistributorController.distributor_get_product_retailer
  );

  route.post('/forgot_password' , RetailerController.forGotPassword)
  route.post('/update_password' , RetailerController.updatePassword)

  //offers
  route.post("/addoffer", auth, RetailerController.addoffer);
  route.get("/get_my_inventory",auth,DistributorController.inventory_download)
  // admin.post("/addoffer", upload.uploadToS3, OfferController.addoffer);
};
