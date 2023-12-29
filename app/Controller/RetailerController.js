const Retailer = require("../Models/Retailer");
const banner = require('../Models/Banner.js');
const category = require('../Models/Category.js');
const offer = require('../Models/Offer');
const Distributor = require("../Models/Distributor");
const Product = require('../Models/Product');
const Order = require('../Models/Order');
const Cart = require('../Models/Cart');
const mongodb = require("mongodb");
const generateUsertoken = require("../Common/common.js");
const fs = require("fs");
const e = require("cors");
const token = require("../Models/token");
const nodemailer = require('./nodemailer')
const bcrypt = require("bcrypt");
const { bucket } = require("../../firebase/firebase");
const { v4: uuidv4 } = require('uuid');
// const fs = require('fs/promises')

require("dotenv").config();

// login function
module.exports.retailer_login = async (req, resp) => {
  // create jwt token
  console.log(req.body);
  const { phoneNumber, password } = req.body;
  Retailer.findOne({
    phonenumber: phoneNumber,
    password: password,
  }).then(async (result) => {
    console.log(">>>>>>>>>>>>>>>", result);
    if (result != null) {
      const jwt = generateUsertoken(result);
      let saveToken = new token({ token: jwt });
      await saveToken.save();
      resp.json({
        status: true,
        message: "login successful",
        data: result,
        token: jwt,
      });
    } else {
      resp.json({ status: false, message: "login unsuccessful" });
    }
  });
};

// get user details using token
module.exports.retailer_register = async (req, resp) => {
  try {

    const user = await Retailer.findOne({ phonenumber: req.body.phone })

    if (user) {
      return resp.send({ status: false, message: "Retailer already exist" });
    }


    var data = req.body;


    const gstCertificateImage = req.files.find(
      (file) => file.fieldname === "RetailerGSTCertificateImage"
    );
    const drugLicenseImage = req.files.find(
      (file) => file.fieldname === "RetailerDrugLicenseImage"
    );

    // console.log('data',data)
    if (!gstCertificateImage || !drugLicenseImage) {
      return resp.status(400).json({
        message:
          "Both RetailerGSTCertificateImage and RetailerDrugLicenseImage are required",
      });
    }

    // // Check for the presence of "image1" and "image2" properties in req.files
    // if (!req.files["RetailerDrugLicenseImage"] || !req.files["RetailerGSTCertificateImage"]) {
    //   return resp.status(400).json({
    //     message: "Both RetailerGSTCertificateImage and RetailerDrugLicenseImage are required",
    //   });
    // }

    // console.log('req.files',req.files)

    // data.licenseimage = req.files["image1"][0].location;
    // data.gstimage = req.files["image2"][0].location;

    // Handle GST Certificate image upload to Firebase Storage

    // ......................................................................................................
    // const gstCertificateUpload = bucket.file(
    //   `RetailerGSTCertificateImage/${gstCertificateImage.originalname}`
    // );
    // const gstCertificateBlobStream = gstCertificateUpload.createWriteStream();

    // gstCertificateBlobStream.on("error", (error) => {
    //   console.error("Error uploading GST Certificate image to Firebase:", error);
    //   return next(error);
    // });

    // bucket.upload()

    // gstCertificateBlobStream.on("finish", () => {
    //   // GST Certificate image uploaded successfully
    //   console.log(">>>>>>>>>>>>>>>>>>>>", bucket.name);
    //   const gstCertificateImageUrl = `https://storage.googleapis.com/${bucket.name}/${gstCertificateUpload.name}`;
    //   req.body.GSTCertificateImage = gstCertificateImageUrl;
    //   console.log(gstCertificateImageUrl,'?????????????????????????????????????????????????????')
    //   // Handle Drug License image upload to Firebase Storage
    //   const drugLicenseUpload = bucket.file(
    //     `RetailerDrugLicenseImage/${drugLicenseImage.originalname}`
    //   );
    //   const drugLicenseBlobStream = drugLicenseUpload.createWriteStream({
    //     metadata :{
    //       token: uuidv4()
    //     }
    //   });

    //   drugLicenseBlobStream.on("error", (error) => {
    //     console.error(
    //       "Error uploading Retailer Drug License image to Firebase:",
    //       error
    //     );
    //     return next(error);
    //   });

    //   drugLicenseBlobStream.on("finish", async () => {
    //     // Retailer Drug License image uploaded successfully
    //     const drugLicenseImageUrl = `https://storage.googleapis.com/${bucket.name}/${drugLicenseUpload.name}`;

    //     // Update req.body with image URLs
    //     // console.log(gstCertificateImageUrl)
    //     console.log(drugLicenseImageUrl,'........................................................')
    //     req.body.DrugLicenseImage = drugLicenseImageUrl;

    //     const {
    //       typeOfBusiness,
    //       businessName,
    //       ownerName,
    //       businessAddress,
    //       pincode,
    //       city,
    //       area,
    //       phone,
    //       password,
    //       email,
    //       pharmacistName,
    //       licenseNumber,
    //       gstInNumber,
    //       panNumber,
    //     } = req.body;

    //     console.log("reqbody:",req.body);
    //    const newData = {
    //     businesstype:  typeOfBusiness,
    //     businessname: businessName,
    //     ownername: ownerName,
    //     address: businessAddress,
    //     pincode: pincode,
    //     city: city,
    //     area: area,
    //     phonenumber: phone,
    //     password: password,
    //     email: email,
    //     pharname:  pharmacistName,
    //     licenseno: licenseNumber,
    //     gstno:  gstInNumber,
    //     panno:  panNumber,
    //     licenseimage: `https://storage.googleapis.com/${bucket.name}/${drugLicenseImage.originalname}`,
    //     gstimage: `https://storage.googleapis.com/${bucket.name}/${gstCertificateImage.originalname}`,
    //     // licenseimage: req.body.GSTCertificateImage,
    //     // gstimage: req.body.DrugLicenseImage,
    //     // licenseimage: req.files[0].destination + '/' + req.files[0].filename,
    //     // gstimage: req.files[1].destination + '/' + req.files[1].filename,
    //     }

    //     console.log("newdata>>>>>>>>>>>:",newData);

    //     const retailer = new Retailer(newData);
    //     const retailer_data = await retailer.save();
    //     // console.log(retailer_data);
    //   });

    //   drugLicenseBlobStream.end(drugLicenseImage.buffer);
    // });

    // gstCertificateBlobStream.end(gstCertificateImage.buffer);

    // resp.send({ status: true, message: "Retailer signup successfull" });

    // ............................................................................................

    const tempPath = 'tempfile.jpg';
    fs.writeFileSync(tempPath, Buffer.from(gstCertificateImage.buffer));
    const imagePath = `${Date.now()}.png`;
    bucket.upload(tempPath, {
      destination: `RetailerGSTCertificateImage/${imagePath}`,
      metadata: {
        contentType: 'image/png',
        metadata: {
          firebaseStorageDownloadToken: uuidv4()
        }
      }
    },
      async (err, file) => {
        if (err) {
          return resp.status(500).send({ status: false, message: "Internal Server Error" });
        }
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-3000',
        });
        req.body.gstImageURL = url

        fs.writeFileSync(tempPath, Buffer.from(drugLicenseImage.buffer));
        const imagePath = `${Date.now()}.png`;
        bucket.upload(tempPath, {
          destination: `RetailerDrugLicenseImage/${imagePath}`,
          metadata: {
            contentType: 'image/png',
            metadata: {
              firebaseStorageDownloadToken: uuidv4()
            }
          }
        }, async (err, file) => {
          if (err) {
            return resp.status(500).send({ status: false, message: "Internal Server Error" });
          }
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '01-01-3000',
          });
          req.body.drugImageURL = url

          const {
            typeOfBusiness,
            businessName,
            ownerName,
            state,
            businessAddress,
            pincode,
            city,
            area,
            phone,
            password,
            email,
            pharmacistName,
            PharmacistPhoneNo,
            licenseNumber,
            gstInNumber,
            panNumber,
            gstImageURL,
            drugImageURL
          } = req.body;

          const newData = {
            businesstype: typeOfBusiness,
            businessname: businessName,
            ownername: ownerName,
            state: state,
            address: businessAddress,
            pincode: pincode,
            city: city,
            area: area,
            phonenumber: phone,
            password: password,
            email: email,
            pharname: pharmacistName,
            pharphone: PharmacistPhoneNo,
            licenseno: licenseNumber,
            gstno: gstInNumber,
            panno: panNumber,
            licenseimage: drugImageURL,
            gstimage: gstImageURL,
          }

          const retailer = new Retailer(newData);
          const retailer_data = await retailer.save();

          fs.unlinkSync(tempPath);
          return resp.status(200).json({
            status: true,
            message: 'Retailer signup successfully',
          })

        })
      })



  } catch (err) {
    console.log(err);
    resp.status(500).send({ status: false, message: "Internal Server Error" });
  }

};

// update user details
module.exports.retailer_update = async (req, resp) => {
  console.log(req.body);
  var data = req.body;

  await Retailer.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: data,

    }
  )
    .then((result) => {
      console.log(result);
      resp.send({ status: true, message: "Retailer Update successfull" });
    })
    .catch((err) => {
      resp.send({ status: false, message: err });
      console.log(err);
    });
};
// delete user details
module.exports.retailer_delete = async (req, resp) => {
  await Retailer.findOneAndDelete({ _id: req.user._id })
    .then((result) => {
      console.log(result);
      resp.send({ status: true, message: "Retailer Delete successfull" });
    })
    .catch((err) => {
      resp.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_profile = async (req, res) => {
  await Retailer.findOne({ _id: req.user._id })
    .then((result) => {
      console.log(result);
      res.send({
        status: true,
        message: "Retailer get successfull",
        data: result,
      });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_home = async (req, res) => {
  try {
    var bannerdata;
    var categorydata;
    var productdata = [];
    var offerdata;

    await banner.find().then((data) => {
      bannerdata = data;
    });

    await category.find().then((cat) => {
      categorydata = cat;
    });

    await offer.find().then((data) => {
      offerdata = data;
    });

    var retailer = await Retailer.findOne({ _id: req.user._id });
    var retailercity = retailer.city;
    var distributor = await Distributor.find({ city: retailercity });
    if (!distributor || distributor.length == 0) return res.send({ status: false, message: "no distributor found for the city" })
    var distributor_id = [];
    distributor.map((id) => {
      distributor_id.push(id._id.toString());
    });

    var pro = await Product.find();
    if (!pro) return res.status({ status: false, message: "please add product" })
    console.log(pro)
    pro.map((item) => {
      if (item.distributors != null || item.distributors.length > 0) {
        item.distributors.map((dis) => {
          console.log(dis)
          if (distributor_id.includes(dis.distributorId)) {
            var obj = {
              name: item.title,
              distributor_name: dis.distributorName,
              price: dis.price,
            };
            productdata.push(obj);
          }
        });
      }
    });

    res.send({
      status: true,
      message: "Retailer home successful",
      bannerdata,
      categorydata,
      productdata,
      offerdata,
    });
  } catch (err) {
    res.send({ status: false, message: err });
    console.log(err);
  }
};

module.exports.category_product = async (req, res) => {
  var productdata = [];
  var retailer = await Retailer.findOne({ _id: req.user._id });
  var retailercity = retailer.city;
  var distributor = await Distributor.find({ city: retailercity });
  var distributor_id = [];
  distributor.map((id) => {
    distributor_id.push(id._id.toString());
  });

  var pro = await Product.find({ category_id: req.body.category_id });
  console.log('pro', pro)
  pro.map((item) => {
    if (item.distributors.length > 0) {
      item.distributors.find((dis) => {
        if (distributor_id.includes(dis.distributorId)) {
          var obj = {
            _id: item._id,
            name: item.title,
            subtitle: item.sub_title,
            price: dis.price,
          };
          productdata.push(obj);
        }
      });
    }
  });

  res.send({
    product: pro,
    status: true,
    message: "Retailer data show successfull",
  });
};

module.exports.get_product = async (req, res) => {
  var productdata = [];
  var retailer = await Retailer.findOne({ _id: req.user._id });
  var retailercity = retailer.city;
  var distributor = await Distributor.find({ city: retailercity });
  var distributor_id = [];
  distributor.map((id) => {
    distributor_id.push(id._id.toString());
  });

  var pro = await Product.find({});

  pro.map((item) => {
    if (item.distributors.length > 0) {
      var lowestPrice = Infinity; // Initialize with highest possible value
      var lowestPriceDistributor = null;

      item.distributors.forEach((dis) => {
        if (distributor_id.includes(dis.distributorId)) {
          if (dis.price < lowestPrice) {
            lowestPrice = dis.price;
            lowestPriceDistributor = dis.distributorName;
          }
        }
      });

      if (lowestPriceDistributor) {
        var obj = {
          id: item._id,
          name: item.title,
          distributor_name: lowestPriceDistributor,
          price: lowestPrice,
        };
        productdata.push(obj);
      }
    }
  });

  res.send({
    product: pro,
    status: true,
    message: "Retailer data show successfull",
  });
};

module.exports.product_details = async (req, res) => {
  var retailer = await Retailer.findOne({ _id: req.user._id });
  var retailercity = retailer.city;
  var distributor = await Distributor.find({ city: retailercity });
  var distributor_id = [];
  var distributor_data = [];
  distributor.map((id) => {
    distributor_id.push(id._id.toString());
  });
  console.log(distributor_id);
  var pro = await Product.findOne({ _id: req.body.id });
  if (pro?.distributors.length > 0) {
    pro.distributors.map((dis) => {
      if (distributor_id.includes(dis.distributorId)) {
        distributor_data.push(dis);
      }
    });
  }

  var product = {
    name: pro?.title,
    subname: pro?.sub_title,
    description: pro?.description,
    price: distributor_data[0]?.price,
    stock: distributor_data[0]?.stock,
    applicable_tax: pro?.applicable_tax,
  };

  res.send({
    product: pro,
    distributor: pro?.distributors,
    status: true,
    message: "Product data show successfull",
  });
};

module.exports.add_to_cart = async (req, res) => {
  await Cart.findOne({ user_id: req.user._id }).then(async (cartdata) => {
    console.log("is cart data coming ?", cartdata);
    if (cartdata != null) {
      if (
        cartdata.distributor_id == req.body.distributor_id &&
        cartdata.product_id == req.body.product_id
      ) {
        return res.send({
          status: true,
          message: "Item already in cart",
        });
      }
      else if (cartdata.distributor_id != req.body.distributor_id) {
        return res.send({
          status: false,
          message: "You can order one distributor at one time",
        });
      }
      else {
        var obj = {
          user_id: req.user._id,
          product_id: req.body.product_id,
          distributor_id: req.body.distributor_id,
          quantity: req.body.quantity,
        };
        await Cart.create(obj)
          .then((item) => {
            res.send({
              status: true,
              message: "add to cart successfull",
            });
          })
          .catch((err) => {
            response.sendResponse(res, false, err);
          });
      }
    } else {
      var obj = {
        user_id: req.user._id,
        product_id: req.body.product_id,
        distributor_id: req.body.distributor_id,
        quantity: req.body.quantity,
      };
      await Cart.create(obj)
        .then((item) => {
          res.send({
            status: true,
            message: "add to cart successfull",
          });
        })
        .catch((err) => {
          response.sendResponse(res, false, err);
        });
    }
  });
};

module.exports.get_cart = async (req, res) => {
  console.log("ID>>>>>>>>>>>>>>>>>>>", req.user._id);
  Cart.find({ user_id: req.user._id })
    .then(async (item) => {
      console.log("cart values", item); // Log the fetched items
      var arr = [];
      for (var i = 0; i < item.length; i++) {
        // console.log("Entering ther loop");
        var product = await Product.findOne({ _id: item[i].product_id }).catch((err) => {
          console.error("Error fetching product:", err);
        });
        console.log("PRODUCT", product);
        var dis = product?.distributors?.filter(
          (pro) => pro.distributorId == item[i].distributor_id
        );
        console.log("DIS", dis);
        var obj = {
          _id: item[i]?._id,
          product_id: item[i]?.product_id,
          product_name: product?.title,
          distributor_name: dis[i]?.fristname,
          distributor_id: dis[i]?.distributorId,
          price: dis[i]?.price,
          quantity: item[i]?.quantity,
          product: product
        };
        arr.push(obj);
        console.log("object xoxoxo", obj);
      }
      res.send({
        status: true,
        data: arr,
        message: "cart data show successfully",
      });
    })
    .catch((err) => {
      console.log(err)
      res.send({
        status: false,
        message: err,
      });
    });
};
module.exports.update_cart = async (req, res) => {
  await Cart.findOneAndUpdate(
    { _id: req.body.cart_id },
    {
      quantity: req.body.quantity,
    }
  )
    .then((result) => {
      res.send({
        status: true,
        message: "cart data update successfull",
      });
    })
    .catch((err) => {
      console.log(err)
      res.send({
        status: false,
        message: err,
      });
    });
};

module.exports.delete_cart = async (req, res) => {
  await Cart.findOneAndDelete({ _id: req.body.cart_id })
    .then((result) => {
      res.send({
        status: true,
        message: "cart data delete successfull",
      });
    })
    .catch((err) => {
      res.send({
        status: false,
        message: err,
      });
    });
};

module.exports.retailer_list = async (req, res) => {
  await Retailer.find(
    { verify: true },
    { businessname: 1, ownername: 1, city: 1, area: 1, phonenumber: 1 }
  )
    .then((result) => {
      res.send({ status: true, message: "Retailer List", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_request = async (req, res) => {
  await Retailer.find(
    { verify: false },
    { businessname: 1, ownername: 1, city: 1, area: 1, phonenumber: 1 }
  )
    .then((result) => {
      res.send({ status: true, message: "Retailer List", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_approve = async (req, res) => {
  await Retailer.findOneAndUpdate(
    { _id: req.body.id },
    { verify: true },
    { new: true }
  )
    .then((result) => {
      res.send({ status: true, message: "Retailer Approved", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.retailer_detail = async (req, res) => {
  await Retailer.findOne({ _id: req.body.id })
    .then((result) => {
      res.send({ status: true, message: "Retailer Detail", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.checkout = async (req, res) => {
  try {
    let item = [];
    let distributorId;


    await Cart.find({ user_id: req.user._id }).then(async (cartdata) => {
      var len = cartdata?.length;

      distributorId = cartdata[0].distributor_id;
      for (var i = 0; i < len; i++) {
        var product = await Product.findOne({ _id: cartdata[i].product_id });
        // console.log(product)
        product?.distributors?.forEach(async (e) => {
          if (e.distributorId == distributorId) {
            if (!parseInt(e.stock) > parseInt(cartdata?.quantity)) {
              throw new Error("Not enough stock");
            }
          }
        });

        var price = product?.distributors?.filter(
          (pro) => pro.distributorId == cartdata[0].distributor_id
        );


        var obje = {

          id: product._id,
          name: product.title,
          image: product.image,
          price: price[0].price,
          tax: product.applicable_tax,
          batch_no: "",
          exp_date: "",
          quantity: cartdata[0].quantity,
        };
        item.push(obje);
      }
      await product.save();
    });

    var orderid =
      "MEDI" + (Math.floor(Math.random() * (99999 - 11111)) + 11111);

    console.log(orderid, "ORDERID");

    var obj = {
      retailer_id: req.user._id,
      order_id: orderid,
      distributor_id: distributorId,
      price: req.body.price,
      products: item,
      payment_type: req.body.payment_type,
      bonus_quantity: req.body.bonus_quantity,
    };
    await Order.create(obj)
      .then((item) => {
        res.send({ status: true, message: "order success", data: item });
      })
      .catch((err) => {
        res.send({ status: true, message: err.message, data: null });
      });
  } catch (err) {
    console.log(err);
    res.send({ status: true, message: err.message, data: null });
  }
};

module.exports.my_order = async (req, res) => {
  await Order.find({ retailer_id: req.user._id })
    .sort({ createdAt: -1 })
    .then((result) => {
      res.send({ status: true, message: "My Order", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.return_order = async (req, res) => {
  console.log("called");
  const id = req.body.order_id;
  console.log(">>>>>>>>>>>>", id);

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { order_id: id, order_status: 3 },
      {
        order_id: "RETURN" + id,
        return_quantity: req.body.quantity,
        return_status: 1,
        return_reason: req.body.reason,
        return_message: req.body.message,
        // return_image: req.body.url,
      },
      { new: true }
    );
    console.log(">>>>>>>>>>>>", updatedOrder)
    if (updatedOrder) {
      return res.send({
        status: true,
        message: "Order return success",
        data: updatedOrder,
      });
    } else {
      return res.send({
        status: false,
        message: "Order not found or already complete",
        data: null,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: false, message: "Internal server error" });
  }
};


// module.exports.return_order = async (req, res) => {
//   console.log("called");
//   var id = req.body.order_id;
//   console.log(">>>>>>>>>>>>",id);
//   var status = "returned";

//   // const image = req.files.find(
//   //   (file) => file.fieldname === "image"
//   // );

//   // const tempPath = 'tempfile.jpg';
//   // fs.writeFileSync(tempPath, Buffer.from(image.buffer));
//   // const imagePath = `${Date.now()}.png`;
//   // bucket.upload(tempPath, {
//   //   destination: `ReturnOrder/${imagePath}`,
//     // metadata: {
//     //   contentType: 'image/png',
//     //   metadata: {
//     //     firebaseStorageDownloadToken: uuidv4()
//     //   }
//     // }

//     const data= await Order.updateOne(
//        { order_id: id, order_status: 3 },
//        {
//          order_id: "RETURN" + id,
//          return_quantity: req.body.quantity,
//          return_status: 1,
//          return_reason: req.body.reason,
//          return_message: req.body.message,
//          // return_image: req.body.url,
//        }
//      )
//     .then(() => {
//         // if (result.modifiedCount > 0) {
//           return res.send({
//             status: true,
//             message: "order return success",
//             data: data,
//           });
//         // }
//         // res.send({
//         //   status: false,
//         //   message: "order already complete or not found",
//         //   data: null,
//         // });
//       })
//       .catch((err) => {
//         res.send({ status: false, message: err });
//         console.log(err);
//       }); 
//   }, async (err) => {
// if (err) {
//   return res.status(500).send({ status: false, message: "Internal Server Error" });
// }
// const [url] = await file.getSignedUrl({
//   action: 'read',
//   expires: '01-01-3000',
// });
// req.body.url = url
// console.log("IMAGEURL", url);
// fs.unlinkSync(tempPath)
// await Order.updateOne(
//   { order_id: id, order_status: 3 },
//   {
//     order_id: "RETURN" + id,
//     return_quantity: req.body.quantity,
//     return_status: 1,
//     return_reason: req.body.reason,
//     return_message: req.body.message,
//     // return_image: req.body.url,
//   }
// )
//   .then((result) => {
//     if (result.modifiedCount > 0) {
//       return res.send({
//         status: true,
//         message: "order return success",
//         data: result,
//       });
//     }
//     res.send({
//       status: false,
//       message: "order already complete or not found",
//       data: null,
//     });
//   })
//   .catch((err) => {
//     res.send({ status: false, message: err });
//     console.log(err);
//   });
// }
// )

// };

module.exports.order_details = async (req, res) => {
  try {
    await Order.find({ order_id: req.query.order_id })
      .then(async (result) => {
        let totalAmount = 0;
        let getProductTax;
        result[0].products.map(async (e) => {
          totalAmount += result[0].price * e.quantity ?? 1;
        });
        result = result[0];
        getProductTax = await Product.findOne({ _id: result.products[0].id });
        console.log(getProductTax);

        let distributerName = await Distributor.findOne({
          _id: result.distributor_id,
        });
        let retailerName = await Retailer.findOne({
          _id: result.retailer_id,
        });
        result._doc.distributor_name =
          distributerName?.firstname + " " + distributerName?.lastname;
        console.log(">>?>?>", result._doc.distributor_name);
        result._doc.distributor_address =
          distributerName?.city +
          " " +
          distributerName?.area +
          " " +
          distributerName?.state;
        result._doc.retailer_name = retailerName.ownername;
        result._doc.retailer_address = retailerName.address;
        result._doc.item_total = totalAmount;
        result._doc.Tax = (totalAmount * getProductTax?.applicable_tax) / 100;
        result._doc.applicable_tax = getProductTax?.applicable_tax;

        result._doc.delivery_fee = 100;
        result._doc.order_total =
          result._doc.item_total + result._doc.Tax + result._doc.delivery_fee;
        res.send({
          status: true,
          message: "Order Details",
          data: result,
        });
      })
      .catch((err) => {
        res.send({ status: false, message: err });
        console.log(err);
      });
  } catch (err) {
    res.send({ status: false, message: err });
    console.log(err);
  }
};

module.exports.logout = async (req, res) => {
  try {
    const auth_token = req.headers["token"];
    let checkExist = await token.deleteOne({ token: auth_token });
    res.json({
      status: true,
      message: "logout successful",
      data: null,
      token: "",
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: true,
      message: "logout failed",
      data: null,
      token: "",
    });
  }
};

module.exports.get_return = async (req, res) => {
  try {
    let obj = {};
    if (!req.query.from && !req.query.to) {
      obj = {
        return_status: { $gt: 0 },
        $or: [{ distributor_id: req.user._id }, { retailer_id: req.user._id }],
      };
    } else {
      obj = {
        return_status: { $gt: 0 },
        $or: [{ distributor_id: req.user._id }, { retailer_id: req.user._id }],
        // createdAt: {
        //   $gte: req.query.from,
        //   $lte: req.query.to,
        // },
      };
    }
    await Order.find(obj)
      .then(async (item) => {
        const mappedResults = await Promise.all(
          item.map(async (e) => {
            let distributerName = await Distributor.findOne({
              _id: e.distributor_id,
            });
            let retailerName = await Retailer.findOne({
              _id: e.retailer_id,
            });
            e._doc.distributor_name =
              distributerName?.firstname + " " + distributerName?.lastname;
            e._doc.retailer_name = retailerName?.ownername;
            return e;
          })
        );
        res.send({
          status: true,
          message: "data fetched",
          data: mappedResults,
        });
      })
      .catch((err) => {
        res.send({
          status: false,
          message: "data fetch failed",
          data: null,
        });
      });
  } catch (err) {
    console.log(err);
  }
};
module.exports.retailer_search = async (req, res) => {
  try {
    let keyword = req.query.value; // Replace "keyword" with your desired search term
    let field_name = req.query.field_name;
    let regexPattern = new RegExp(keyword, "i"); // "i" flag for case-insensitive search
    let obj = {
      [field_name]: regexPattern,
    };

    await Retailer.find(obj)
      .then((item) => {
        res.send({ status: true, message: "data fetched", product: item });
      })
      .catch((err) => {
        res.send({
          status: false,
          message: "data fetch failed",
          product: null,
        });
      });
  } catch (err) {
    console.log(err);
  }
};

module.exports.cancel_order_retailer = async (req, res) => {
  try {
    let get_order = await Order.findOne({
      order_id: req.query.order_id,
      order_status: 4,
    });
    if (get_order) {
      get_order.order_status = 0;
      await get_order.save();

      return res.send({ status: true, message: "order cancelled" });
    }
    res.send({ status: true, message: "cannot cancel" });
  } catch (err) {
    console.log(err);
    res.send({ Status: false, message: err.message });
  }
};
module.exports.cancel_order_admin = async (req, res) => {
  try {
    let get_order = await Order.findOne({
      order_id: req.query.order_id,
      order_status: { $gt: 0 },
    });
    if (get_order) {
      get_order.order_status = 0;
      await get_order.save();
      return res.send({ status: true, message: "order cancelled" });
    }
    res.send({ status: true, message: "cannot cancel or not found" });
  } catch (err) {
    console.log(err);
    res.send({ Status: false, message: err.message });
  }
};


exports.retailer_reject = async (req, res) => {
  const retailerId = req.body.id;

  try {
    // Find the retailer based on retailerId
    const retailer = await Retailer.findOne({ _id: retailerId });

    if (!retailer) {
      // Check if the retailer was not found
      return res.status(404).json({ success: false, message: 'Retailer not found.' });
    }

    // Update the retailer to set verify to false
    retailer.verify = false;
    await retailer.save();

    res.status(200).json({ success: true, message: 'Retailer Rejected successfully.', data: retailer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reject Retailer.' });
  }
};


module.exports.forGotPassword = async (req, res, next) => {


  var user = await Retailer.findOne({ email: req.body.email })



  if (user) {
    var val = Math.floor(1000 + Math.random() * 9000);

    nodemailer.sendEmail({
      from: "admin@meddaily.in",
      to: req.body.email,
      subject: "OTP Verification",
      text: "Hi your one time password is " + val
    })

    res.send({ status: true, otp: val })
  } else {
    res.send({
      status: false, message: "user is not valid, please enter valid email"
    })
  }











}

module.exports.updatePassword = async (req, res, next) => {


  var user = await Retailer.findOne({ email: req.body.email })



  if (user) {

    var UpdateUser = await Retailer.findOneAndUpdate({ email: req.body.email }, { $set: { password: req.body.password } })

    res.send({ status: true, message: "Password updated successfully" })
  } else {
    res.send({
      status: false, message: "user is not valid, please enter valid email"
    })
  }


}
// <<<<<<------------------------------Mongo services ------------------------------------------->>>










