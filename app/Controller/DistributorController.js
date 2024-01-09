const Distributor = require("../Models/Distributor");
const Retailer = require("../Models/Retailer");
// const Payout = require("../Models/payout");
// const mongodb = require("mongodb");
const Product = require("../Models/Product");
const { bucket } = require("../../firebase/firebase");
const generateUsertoken = require("../Common/common.js");
const fs = require("fs");
require("dotenv").config();
const token = require("../Models/token");
const Order = require("../Models/Order");
// let easyinvoice = require("easyinvoice");
// const Upload = require("../Middleware/upload");
const { v4: uuidv4 } = require('uuid');
const html_to_pdf = require('html-pdf-node');
const path = require("path");
const ejs = require("ejs");
const ExcelJS = require('exceljs');
const { ObjectId } = require('mongodb');

// login function
module.exports.distributor_login = async (req, resp) => {
  // create jwt token
  const { phone, password } = req.body;
  console.log(req.body, "LOGIN");
  await Distributor.findOne({ phonenumber: phone, password: password }).then(
    async (result) => {
      console.log(result);
      if (result != null) {
        console.log("result verify", result.verify);
        if (result.verify == "true") {
          const jwt = generateUsertoken(result);

          let saveToken = new token({ token: jwt });

          await saveToken.save();
          resp.json({
            status: true,
            message: "login successful",
            data: result,
            token: jwt,
          });
        }
        else {
          resp.json({ status: false, message: 'Distributor not verified' });
        }
      } else {
        resp.json({ status: false, message: "login unsuccessful" });
      }
    }
  );
};

// get user details using token
module.exports.distributor_register = async (req, resp) => {
  console.log("BODY", req.body);
  await Distributor.findOne({ phonenumber: req.body.phonenumber }).then(
    async (user) => {
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", user);
      if (user != null) {
        return resp.send({
          status: false,
          message: "Distributor already exist",
        });
      } else {
        var data = req.body;
        console.log("FILE", req.files);

        const image1 = req.files.find(
          (file) => file.fieldname === "image1"
        );
        const image2 = req.files.find(
          (file) => file.fieldname === "image2"
        );

        // console.log('data',data)
        if (!image1 || !image2) {
          return resp.status(400).json({
            message:
              "Both RetailerGSTCertificateImage and RetailerDrugLicenseImage are required",
          });
        }


        // data["gst_file"] = req.files["image1"][0].location;
        // data["image"] = req.files["image2"][0].location;

        // console.log(data);

        // const retailer = new Distributor(data);
        // console.log("==========================>>>>>>>>>>>>", req.files);
        // console.log(retailer);

        const tempPath = 'tempfile.png';
        fs.writeFileSync(tempPath, Buffer.from(image1.buffer));
        const imagePath = `${Date.now()}.png`;
        bucket.upload(tempPath, {
          destination: `GSTCertificateImage/${imagePath}`,
          metadata: {
            contentType: 'image/png',
            metadata: {
              firebaseStorageDownloadToken: uuidv4()
            }
          }
        }, async (err, file) => {
          if (err) {
            console.log(err, "new>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            return resp.status(500).send({ status: false, message: "Internal Server Error" });
          }
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '01-01-3000',
          });
          console.log(url)
          req.body.gstImageURL = url

          fs.writeFileSync(tempPath, Buffer.from(image2.buffer));
          const imagePath = `${Date.now()}.png`;
          bucket.upload(tempPath, {
            destination: `DrugLicenseImage/${imagePath}`,
            metadata: {
              contentType: 'image/png',
              metadata: {
                firebaseStorageDownloadToken: uuidv4()
              }
            }
          }, async (err, file) => {
            if (err) {
              console.log(err);
              return resp.status(500).send({ status: false, message: "Internal Server Error" });
            }
            const [url] = await file.getSignedUrl({
              action: 'read',
              expires: '01-01-3000',
            });
            console.log(url)
            req.body.drugImageURL = url

            const {
              firstname,
              lastname,
              pincode,
              phonenumber,
              city,
              area,
              state,
              distributorcode,
              gst_number,
              bank_name,
              distributortype,
              benificiary_name,
              account_number,
              gstImageURL,
              drugImageURL,
              drug_licence,
              email,
              password,
              ifsc_code,
            } = req.body;
            // console.log("BODYREQ",req.body);

            const newData = {
              firstname: firstname,
              lastname: lastname,
              pincode: pincode,
              city: city,
              area: area,
              state: state,
              password: password,
              distributorcode: distributorcode,
              distributortype: distributortype,
              gst_number: gst_number,
              email: email,
              phonenumber: phonenumber,
              bank_name: bank_name,
              benificiary_name: benificiary_name,
              account_number: account_number,
              gst_file: gstImageURL,
              image: drugImageURL,
              ifsc_code: ifsc_code,
              drug_licence: drug_licence
            }
            // console.log("NEWDAT",newData);
            // const distributer = new Distributor({newData});
            // const distributer_data = await distributer.save();
            const distributer_data = await Distributor.create(newData)
            fs.unlinkSync(tempPath);
            return resp.status(200).json({
              status: true,
              message: 'Retailer signup successfully',
              data: distributer_data
            })

          })
        })
        // const retailer_data = await retailer.save();
        // console.log(retailer_data);

        // resp.send({ status: true, message: "Distributor signup successfull" });
      }
    }
  );
};

// update user details
module.exports.distributor_update = async (req, resp) => {
  console.log(req.body);
  var data = req.body;

  await Distributor.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: data,
    }
  )
    .then((result) => {
      console.log(result);
      resp.send({ status: true, message: "Distributor Update successfull" });
    })
    .catch((err) => {
      resp.send({ status: false, message: err });
      console.log(err);
    });
};
module.exports.distributor_profile = async (req, resp) => {
  await Distributor.findOne({ _id: req.user._id })
    .then((result) => {
      resp.send({
        status: true,
        message: "Distributor get successfull",
        data: result,
      });
    })
    .catch((err) => {
      resp.send({ status: false, message: err });
      console.log(err);
    });
};

// delete user details
module.exports.distributor_delete = async (req, resp) => {
  await Distributor.findOneAndDelete({ _id: req.user._id })
    .then((result) => {
      console.log(result);
      resp.send({ status: true, message: "Distributor Delete successfull" });
    })
    .catch((err) => {
      resp.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.distributor_list = async (req, res) => {
  await Distributor.find(
    { verify: true },
    { firstname: 1, lastname: 1, city: 1, area: 1, phonenumber: 1 }
  )
    .then((result) => {
      res.send({ status: true, message: "Distributor List", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.distributor_detail = async (req, res) => {
  await Distributor.findOne({ _id: req.body.id })
    .then((result) => {
      res.send({ status: true, message: "Distributor Detail", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.distributor_approve = async (req, res) => {
  await Distributor.findOneAndUpdate(
    { _id: req.body.id },
    { verify: true },
    { new: true }
  )
    .then((result) => {
      res.send({ status: true, message: "Distributor Approved", data: result });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};


module.exports.all_payout_request = async (req, res) => {

  const disId = req.user._id
  if (req.params.id == "All") {
    var obj = { distributor_id: disId };
  } else {
    var obj = { payment_status: req.params.id, distributor_id: disId };
  }
  console.log("?????????MMMMMMMMMMMMMMMMMMMMMM", obj);
  await payout_transactions
    .find(obj).populate('distributor_id')
    .sort({ createdAt: -1 })
    .then((item) => {
      console.log("<<<<<<<<<<<<<<<", item);
      res.send({ status: true, message: "success", data: item });
    })
    .catch((err) => {
      console.log("??????????????", err);
      res.send({ status: false, message: "fail", data: err });
    });
};

module.exports.distributor_request = async (req, res) => {
  await Distributor.find(
    { verify: false },
    { firstname: 1, lastname: 1, city: 1, area: 1, phonenumber: 1, distributorcode: 1 }
  )
    .then((result) => {
      res.send({
        status: true,
        message: "Distributor Request List",
        data: result,
      });
      console.log("resu", result);
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.distributor_get_product = async (req, res) => {
  var pro = await Product.find(
    {},
    { _id: 1, title: 1, image: 1, description: 1, sub_title: 1 }
  );
  pro = pro.map((product) => {
    return {
      _id: product._id,
      name: product.title,
      image: product.image,
      sub_title: product.sub_title,
      description: product.description,
    };
  });

  res.send({
    product: pro,
    status: true,
    message: "distributor data show successfull",
  });
};

module.exports.distributor_order = async (req, res) => {
  await Order.find({ distributor_id: req.user._id, return_status: 0 })
    .sort({ createdAt: -1 })
    .then(async (result) => {
      const mappedResults = await Promise.all(
        result.map(async (e) => {
          let distributerName = await Distributor.findOne({
            _id: e.distributor_id,
          });
          let retailerName = await Retailer.findOne({
            _id: e.retailer_id,
          });
          e._doc.distributor_name =
            distributerName.firstname + " " + distributerName.lastname;
          e._doc.retailer_name = retailerName?.ownername;
          return e;
        })
      );
      res.send({ status: true, message: "My Order", data: mappedResults });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};

module.exports.return_order_accept = async (req, res) => {
  var id = req.body.order_id;
  var status = "accepted";
  let getOrder = await Order.findOne({ order_id: id });
  if (getOrder?.return_status == 2) {
    return res.send({ status: false, message: "Already accepted" });
  }
  await Order.updateOne({ order_id: id }, { return_status: 2 }, { new: true })
    .then((result) => {
      res.send({
        status: true,
        message: "order return accepted",
        data: result,
      });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};
const payout_transactions = require("../Models/payout_transaction");
module.exports.create_payout = async (req, res) => {
  try {

    console.log("???????????????", req.user._id);
    let getData = await payout.findOne({ distributor_id: req.user._id });
    console.log("???????????????", getData);

    // if (!getData || getData.length == 0) {
    //   return res.send({ status: true, message: " not found" });
    // } else {
    console.log(req.body);
    if (getData?.amount && getData?.amount >= req.body.amount) {
      getData.amount -= req.body.amount;
      let transactionObj = {
        amount: req.body.amount,
        distributor_id: req.user._id,
        remaining_balance: getData.amount,
      };
      let insert = new payout_transactions(transactionObj);
      await insert.save();
      await getData.save();
      return res.send({
        status: true,
        message: "transaction initiated ",
        data: transactionObj,
      });
    } else if (getData == null) {
      let transactionObj = {
        amount: req.body.amount,
        distributor_id: req.user._id,
        remaining_balance: 50,
      };
      let pay = {
        distributor_id: req.user._id,
        amount: req.body.amount
      }
      let insert = new payout_transactions(transactionObj);
      let getData = new payout(transactionObj);
      await insert.save();
      await getData.save();
      return res.send({
        status: true,
        message: "transaction initiated ",
        data: transactionObj,
      });
    } {
      return res.send({
        status: true,
        message: "Not enough balance",
        data: null,
      });
    }
    // }
  } catch (err) {
    res.send({ status: false, message: err });
    console.log(err);
  }
};

const mongoose = require("mongoose");
// module.exports.create_invoice = async (req, res) => {
//   try {
//     const { items, order_id } = req.body;

//     // Find the order by order_id
//     const getOrder = await Order.findOne({ order_id: order_id });
//     if (!getOrder) throw new Error("Order not found");

//     // Check order status
//     if (getOrder.order_status === 1 || getOrder.order_status === 3) {
//       return res.send({ status: true, message: "Order already completed" });
//     }

//     console.log("===================>", getOrder);

//     // Iterate through items and update stock for each product
//     for (const item of items) {
//       const objectId = getOrder.distributor_id;
//       const idValue = objectId.valueOf();

//       await Product.updateOne(
//         {
//           _id: getOrder.products[0].id,
//           "distributors.distributorId": idValue
//         },
//         {
//           $inc: {
//             "distributors.$.stock": -parseInt(getOrder.products[0].quantity)
//           }
//         }
//       );

//       // Assign batch_no and exp_date to the product in the order
//       getOrder.products[0].batch_no = item.batch_no;
//       getOrder.products[0].exp_date = item.exp_date;
//     }

//     // Set order status to 1 (assuming 1 means completed)
//     getOrder.order_status = 1;

//     // Save the updated order
//     await getOrder.save();

//     res.send({ status: true, message: "Order completion success" });
//   } catch (err) {
//     console.error(err);
//     res.send({ err: true, data: err.message });
//   }
// };

module.exports.create_invoice = async (req, res) => {
  try {
    const { items, order_id } = req.body;

    // Find the order by order_id
    const getOrder = await Order.findOne({ order_id: order_id });
    console.log("GRT", getOrder);
    if (!getOrder) throw new Error("Order not found");

    // Check order status
    // if (getOrder.order_status === 1 || getOrder.order_status === 3) {
    //   return res.send({ status: true, message: "Order already completed" });
    // }

    for (const item of items) {
      const objectId = getOrder.distributor_id;
      // console.log("OBJECTID",objectId);
      const idValue = objectId.valueOf();
      // console.log("IDOF DIS",idValue);
      const productId = item._id;
      // console.log("PRODUCT",productId);
      const quantity = item.quantity;
      // console.log("QUNTITY",quantity);
      await Product.updateOne(
        {
          _id: productId,
          "distributors.distributorId": idValue
        },
        {
          $inc: {
            "distributors.$.stock": -1 * parseInt(quantity)
          }
        }
      );
      const productInOrderIndex = getOrder.products.findIndex(product => product.id.toString() === productId);

      if (productInOrderIndex !== -1) {
        getOrder.products[productInOrderIndex].batch_no = item.batch_no;
        getOrder.products[productInOrderIndex].exp_date = item.exp_date;
      }
    }

    getOrder.order_status = 1;

    await getOrder.save();

    res.send({ status: true, message: "Order completion success" });
  } catch (err) {
    console.error(err);
    res.send({ err: true, data: err.message });
  }
};


// module.exports.create_invoice = async (req, res) => {
//   try {
//     let { batch_no, exp_date, order_id } = req.body;
//     let getOrder = await Order.findOne({ order_id: order_id });
//     if (!getOrder) throw new Error("not found");
//     if (getOrder.order_status == 1 || getOrder.order_status == 3) {
//       return res.send({ status: true, message: "order already completed" });
//     }
//     console.log("===================>", getOrder);
//     const objectId = getOrder.distributor_id;
//     const idValue = objectId.valueOf();

//     await Product.updateOne(
//       { _id: getOrder.products[0].id, "distributors.distributorId": idValue },
//       {
//         $inc: {
//           "distributors.$.stock": -parseInt(getOrder.products[0].quantity),
//         },
//       }
//     );

//     getOrder.batch_no = batch_no;
//     getOrder.exp_date = exp_date;
//     getOrder.order_status = 1;
//     await getOrder.save();

//     res.send({ status: true, message: "order completion success" });
//   } catch (err) {
//     console.log(err);
//     res.send({ err: true, data: err.message });
//   }
// };
module.exports.my_inventory = async (req, res) => {
  const distributorId = req.user._id;
  Product.aggregate([
    { $match: { "distributors.distributorId": distributorId } },
    {
      $project: {
        _id: 1,
        title: 1,
        sub_title: 1,
        distributors: {
          $filter: {
            input: "$distributors",
            as: "distributor",
            cond: { $eq: ["$$distributor.distributorId", distributorId] },
          },
        },
      },
    },
    { $unwind: "$distributors" },
    {
      $project: {
        name: "$title",
        subtitle: "$sub_title",
        price: "$distributors.price",
        stock: "$distributors.stock",
      },
    },
  ])
    .then((results) => {
      if (results.length > 0) {
        res.send({
          status: true,
          message: "My inventory fetched",
          product: results,
        });
      } else {
        console.log("No matching document found.");
        res.send({ status: true, message: "empty" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.send({ status: true, message: err.message });
    });
};
const XLSX = require("xlsx");
const { mkdtemp } = require("fs").promises;
const { join } = require("path");

module.exports.getDemofile = async (req, res) => {
  try {
    const distributorId = req.query.id;
    console.log("distributorId>>>>>>>>>>>>", distributorId);

    Product.aggregate([
      { $match: { "distributors.distributorId": distributorId } },
      {
        $project: {
          _id: { $toString: "$_id" },
          title: 1,
          sub_title: 1,
          distributors: {
            $filter: {
              input: "$distributors",
              as: "distributor",
              cond: { $eq: ["$$distributor.distributorId", distributorId] },
            },
          },
        },
      },
      { $unwind: "$distributors" },
      {
        $project: {
          _id: "$distributors.distributorId", // Include distributorId field
          product_id: "$_id",
          title: 1,
          subtitle: "$sub_title",
          price: "$distributors.price",
          stock: "$distributors.stock",
        },
      },
    ])
      .then(async (results) => {
        console.log("resultsresultsresultsresults", results);
        if (results.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(results); // Convert the array of documents to a worksheet

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1"); // Add the worksheet to the workbook

          try {
            const tempFolder = await mkdtemp(join(__dirname, "temp-"));
            const tempFilePath = join(tempFolder, distributorId + "file.xlsx"); // Specify the file name within the temporary folder

            XLSX.writeFile(workbook, tempFilePath);

            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${distributorId}file.xlsx"`
            );
            res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            const fileStream = fs.createReadStream(tempFilePath);
            fileStream.pipe(res);

            fileStream.on("close", async () => {
              // Remove the temporary file after it has been sent
              fs.unlink(tempFilePath, (error) => {
                if (error) {
                  console.error("Error deleting temporary file:", error);
                } else {
                  console.log("Temporary file deleted");
                }
              });
              await fs.promises.rmdir(tempFolder, { recursive: true }); // Delete the temporary folder and its contents
            });
          } catch (error) {
            console.error("Error creating temporary folder:", error);
            res.status(500).send("Internal Server Error");
          }
        } else {
          console.log("No matching document found.");
          res.send({ status: true, message: "empty" });
        }
      })
      .catch((error) => {
        console.log(error);
        res.send({ status: true, message: error.message });
      });
  } catch (err) {
    console.log(err);
    res.send({ status: true, message: err.message });
  }
};

module.exports.bulkUpdate = async (req, res) => {
  try {
    fileBuffer = req?.files[0]?.buffer;
    const filePath = `bulkCSV${Date.now}.xlsx`;
    fs.writeFileSync(filePath, fileBuffer);

    console.log(req.file, "new file ");
    console.log(req.files, "new filepath");

    // Load the workbook from the file
    const workbook = XLSX.readFile(filePath);

    // Choose the worksheet you want to read (e.g., the first sheet)
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    // Convert the worksheet to JSON format
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Print the JSON data
    console.log("jsonDataas", jsonData);
    for (let e of jsonData) {
      const productId = e.Id;
      console.log("IDs",e.Id);
      // const productId = e.product_id;
      const newPrice = parseInt(e.price);
      const newStock = parseInt(e.stock);

     const dataproduct= Product.updateOne(
        {
          "distributors.distributorId": req.user._id,
          _id: productId,
        },
        {
          $set: {
            "distributors.$.price": newPrice,
            "distributors.$.stock": newStock,
          },
        }
      )
        .then(() => {
          // console.log(">>>>>>>>>",dataproduct);
          // console.log("IDDISTRIBUTOR",req.user._id);
          // console.log("ID",productId);
          console.log("Price and stock values updated successfully.");
        })
        .catch((error) => {
          fs.unlinkSync(filePath);
          console.error("Error updating price and stock values:", error);
        });
    }
    fs.unlinkSync(filePath);
    res.send({ status: true, message: "Data updated successfully" });
  } catch (err) {
    console.log(err);
    fs.unlinkSync(filePath);
    res.send({ status: false, message: err.message });
  }
};

module.exports.distributor_search = async (req, res) => {
  try {
    let keyword = req.query.value; // Replace "keyword" with your desired search term
    let field_name = req.query.field_name;
    let regexPattern = new RegExp(keyword, "i"); // "i" flag for case-insensitive search
    let obj = {
      [field_name]: regexPattern,
    };

    await Distributor.find(obj)
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

module.exports.product_search = async (req, res) => {
  try {
    let keyword = req.query.value; // Replace "keyword" with your desired search term
    let field_name = req.query.field_name;
    let regexPattern = new RegExp(keyword, "i"); // "i" flag for case-insensitive search
    let obj = {
      [field_name]: regexPattern,
    };

    await Product.aggregate([
      { $match: obj }, // Apply any necessary matching conditions
      {
        $project: {
          name: "$title", // Rename field1 to total
          subtitle: "$sub_title", // Include other fields as needed
          price: { $min: "$distributors.price" }, // Find the lowest price
        },
      },
    ])
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
const { rm } = require("fs/promises");
const payout = require("../Models/payout");
const { off } = require("process");

// const PDFDocument = require('pdfkit');

module.exports.get_invoice = async (req, res) => {
  try {
    const getOrder = await Order.findOne({ order_id: req.query.order_id });

    if (!getOrder || getOrder.length == 0) {
      return res.send({ status: false, messsage: 'Order not found' });
    }

    const getRetailer = await Retailer.findOne({ _id: getOrder.retailer_id });
    const getDistributor = await Distributor.findOne({ _id: getOrder.distributor_id });
    console.log("RTEIL", getRetailer);
    console.log("DIS", getDistributor);
    console.log("PRODUCT", getOrder);

    // return res.render('pdf',{getRetailer,getDistributor,getOrder})

    const html = await ejs.renderFile(
      path.join(__dirname, "../views/pdf.ejs"),
      { getRetailer, getDistributor, getOrder }
    );

    html_to_pdf.generatePdf({ content: html }, { format: 'A4', printBackground: true }).then(pdfBuffer => {
      const base64String = pdfBuffer.toString("base64");

      return res.status(200).json({
        status: "Success",
        message: "pdf create successFully",
        data: base64String,
      });
    })
    // pdf.create(html).toBuffer((err, buffer) => {
    //   const base64String = buffer.toString("base64");
    //   return res.status(200).json({
    //     status: "Success",
    //     message: "pdf create successFully",
    //     data: base64String,
    //   });
    // });
    // const doc = new PDFDocument();


    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename=${getOrder.order_id}.pdf`);

    // doc.pipe(res);

    // doc.font('Helvetica-Bold');
    // doc.fontSize(14);

    // doc.text('Order Details', { align: 'center' });
    // doc.text('Retailer Order : Summary and Receipt', { align: 'center', margin: [0, 10] });

    // doc.fontSize(12);
    // doc.text('Order ID:');
    // doc.text(getOrder.order_id.toString());
    // doc.text(`Retailer: ${getRetailer?.businessname}`);
    // doc.text(`Distributor: ${getDistributor?.firstname} ${getDistributor?.lastname}`);
    // doc.text('\n');



    // await Promise.all(getOrder.products.map(async (product) => {
    //   await new Promise(resolve => {
    //     doc.text(`Product ID: ${product?.id}`);
    //     doc.text(`Product Name: ${product.name}`);
    //     doc.text(`Price: ${product.price}`);
    //     doc.text(`Quantity: ${product.quantity}`);
    //     doc.text('\n');
    //     resolve();
    //   });
    // }));

    //     doc.text(`exp_date : ${getOrder?.exp_date}`)
    // doc.text(`bonus_quantity : ${getOrder?.bonus_quantity}`)
    // doc.text(`order_status : ${getOrder?.order_status}`)
    // doc.text(`return_status : ${getOrder?.return_status}`)
    // doc.text(`return_reason : ${getOrder?.return_reason}`)
    // doc.text(`return_message :${getOrder?.return_message}`)
    // doc.text(`payment_status :${getOrder?.payment_status}`)
    // doc.text(`payment_type :${getOrder?.payment_type}`)

    // await new Promise(resolve => {
    //   doc.end();
    //   resolve();
    // });
  } catch (err) {
    console.error(err);
    res.send({ status: false, message: err.message, data: null });
  }
};

// module.exports.get_invoice = async (req, res) => {
//   try {
//     const getOrder = await Order.findOne({ order_id: req.query.order_id });

//     if (!getOrder || getOrder.length == 0) {
//       return res.send({ status: false, messsage: 'Order not found' });
//     }

//     const getRetailer = await Retailer.findOne({ _id: getOrder.retailer_id });
//     const getDistributor = await Distributor.findOne({ _id: getOrder.distributor_id });

//     // Create a new PDF document
//     const doc = new PDFDocument();

//     // Set response headers for PDF
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=${getOrder.order_id}.pdf`);

//     doc.pipe(res);

//     console.log(">>>>>>>>>>>",getOrder);
//     doc.text(`Order ID: ${getOrder?.order_id}`);
//     doc.text(`Retailer: ${getRetailer?.businessname}`);
//     doc.text(`Distributor: ${getDistributor?.firstname} ${getDistributor?.lastname}`);
//     doc.text(`Price: ${getOrder?.price} `);
//     doc.text('\nProducts:');
//     getOrder.products.forEach(product => {
//       doc.text(`    Product ID: ${product?.id}`);
//       doc.text(`    Name: ${product?.name}`);
//       doc.text(`    Price: ${product?.price}`);
//       doc.text(`    Quantity: ${product?.quantity}`);
//       doc.text(`\n`)
//     });
//     doc.text(`\n`)

//     doc.text(`exp_date : ${getOrder?.exp_date}`)
//     doc.text(`bonus_quantity : ${getOrder?.bonus_quantity}`)
//     doc.text(`order_status : ${getOrder?.order_status}`)
//     doc.text(`return_status : ${getOrder?.return_status}`)
//     doc.text(`return_reason : ${getOrder?.return_reason}`)
//     doc.text(`return_message :${getOrder?.return_message}`)
//     doc.text(`payment_status :${getOrder?.payment_status}`)
//     doc.text(`payment_type :${getOrder?.payment_type}`)

//     doc.end();
//   } catch (err) {
//     console.error(err);
//     res.send({ status: false, message: err.message, data: null });
//   }
// };
// module.exports.get_invoice = async (req, res) => {
//   try {
//     let getOrder = await Order.findOne({ order_id: req.query.order_id });
//     if (!getOrder || getOrder.length == 0) {
//       return res.send({ status: false, messsage: "Order not found" });
//     }
//     console.log(getOrder);
//     let getRetailer = await Retailer.findOne({ _id: getOrder.retailer_id });
//     let getDistributor = await Distributor.findOne({
//       _id: getOrder.distributor_id,
//     });

//     var data = {
//       client: {
//         company: getRetailer.businessname,
//         address: getRetailer.address,
//         pin: getRetailer.pincode,
//         city: getRetailer.city,
//         gstno: getRetailer.gstno,
//       },
//       sender: {
//         distributorName: getDistributor?.firstname + getDistributor?.lastname,
//         area: getDistributor?.area,
//         pin: getDistributor?.pin,
//         city: getDistributor?.city,
//         state: getDistributor?.state,
//       },

//       images: {
//         logo: "https://meddaily.s3.ap-south-1.amazonaws.com/MEDDAILY-LOGO-inverted.png",
//       },
//       products: getOrder.products,
//       bottomNotice: "Kindly pay your invoice within 15 days.",
//       settings: {
//         currency: "INR",
//       },
//       translate: {},
//       customize: {
//         // "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
//       },
//     };
//     console.log(data);
//     res.send({ status: true, message: "data fetched ", data: data });
//   } catch (err) {
//     console.log(err);
//     res.send({ status: false, message: err.message, data: null });
//   }
// };

// module.exports.get_summary = async (req, res) => {
//   try {
//     let getOrder = await Order.findOne({ order_id: req.query.order_id });
//     if (!getOrder || getOrder.length == 0) {
//       return res.send({ status: false, messsage: "Order not found" });
//     }
//     console.log(getOrder);
//     let getRetailer = await Retailer.findOne({ _id: getOrder.retailer_id });
//     let getDistributor = await Distributor.findOne({
//       _id: getOrder.distributor_id,
//     });
//     console.log("RE", getRetailer);
//     console.log("DIS", getDistributor);

//     const html = await ejs.renderFile(
//       path.join(__dirname, "../views/summarypdf.ejs"),
//       { getRetailer, getDistributor, getOrder }
//     );
//     pdf.create(html).toBuffer((err, buffer) => {
//       const base64String = buffer.toString("base64");
//       return res.status(200).json({
//         status: "Success",
//         message: "pdf create successFully",
//         data: base64String,
//       });
//     });

//     // var data = {
//     //   client: {
//     //     company: getRetailer.businessname,
//     //     address: getRetailer.address,
//     //     pin: getRetailer.pincode,
//     //     city: getRetailer.city,
//     //     gstno: getRetailer.gstno,
//     //   },
//     //   sender: {
//     //     distributorName: getDistributor.firstname + getDistributor.lastname,
//     //     area: getDistributor.area,
//     //     pin: getDistributor.pin,
//     //     city: getDistributor.city,
//     //     state: getDistributor.state,
//     //   },

//     //   images: {
//     //     logo: "https://meddaily.s3.ap-south-1.amazonaws.com/MEDDAILY-LOGO-inverted.png",
//     //   },
//     //   products: getOrder.products,
//     //   bottomNotice: "Kindly pay your invoice within 15 days.",
//     //   settings: {
//     //     currency: "INR",
//     //   },
//     //   translate: {},
//     //   customize: {
//     //     // "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
//     //   },
//     // };
//     // console.log(data);
//     // return res.render('summarypdf',{getDistributor,getRetailer,getOrder})
//     // res.send({ status: true, message: "data fetched ", data: data });
//   } catch (err) {
//     console.log(err);
//     res.send({ status: false, message: err.message, data: null });
//   }
// };

const util = require('util');
const { log } = require("console");
const ejsRenderFile = util.promisify(ejs.renderFile);

module.exports.get_summary = async (req, res) => {
  try {
    let getOrder = await Order.findOne({ order_id: req.query.order_id });
    console.log("ORDER", req.query.order_id);
    if (!getOrder || getOrder.length == 0) {
      return res.send({ status: false, messsage: "Order not found" });
    }

    let getRetailer = await Retailer.findOne({ _id: getOrder.retailer_id });
    let getDistributor = await Distributor.findOne({
      _id: getOrder.distributor_id,
    });

    const html = await ejsRenderFile(
      path.join(__dirname, "../views/summarypdf.ejs"),
      { getRetailer, getDistributor, getOrder }
    );

    // const buffer00 = await new Promise(async (resolve, reject) => {
    //   const browser = puppeteer.launch({
    //     headless: true,
    //     executablePath: join(__dirname, 'node_modules', '.puppeteer_cache'),
    //   })
    //   const page = (await browser).newPage()
    //   await page.setContent(html, { waitUntil: "networkidle0" });
    //   const pdfBuffer = await page.pdf({
    //     // path:'myPDF002.pdf',
    //     format: 'A4',
    //     // printBackground: true,
    //   });
    //   await browser.close();
    //   resolve(pdfBuffer.buffer)
    //   // pdf.create(html).toBuffer((err, buffer) => {
    //   //   if (err) {
    //   //     reject(err);
    //   //   } else {
    //   //     resolve(buffer);
    //   //   }
    //   // });
    // });

    html_to_pdf.generatePdf({ content: html }, { format: 'A4', printBackground: true }).then(pdfBuffer => {
      const base64String = pdfBuffer.toString("base64");

      return res.status(200).json({
        status: "Success",
        message: "pdf create successFully",
        data: base64String,
      });
    })

    // buffer00.then(buf => {

    //   const base64String = buf.toString("base64");

    //   return res.status(200).json({
    //     status: "Success",
    //     message: "pdf create successFully",
    //     data: base64String,
    //   });
    // })


  } catch (err) {
    console.log(err);
    res.send({ status: false, message: err.message, data: null });
  }
};

module.exports.get_pending_payout = async (req, res) => {
  try {
    let getorders = await Order.aggregate([
      {
        $match: {
          distributor_id: mongoose.Types.ObjectId(req.user._id),
          payment_status: 4,
          return_status: 0,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: null,
          totalSum: { $sum: "$products.price" },
        },
      },
    ]);
    await Order.updateMany(
      {
        distributor_id: mongoose.Types.ObjectId(req.user._id),
        payment_status: 4,
        return_status: 0,
      },
      {
        $set: {
          payment_status: 5,
        },
      }
    );
    console.log(getorders);
    if (!getorders || getorders.length == 0) {
      let findPayout = await payout.findOne({ distributor_id: req.user._id });
      if (!findPayout || findPayout.length == 0) {
        res.send({ status: false, message: "not pending data found " });
      }
      return res.send({
        status: true,
        message: "Payout updated",
        data: findPayout,
      });
    } else {
      console.log(getorders);
      //  amount: {type:Number,default:0},
      //     distributor_id: {type:mongoose.Schema.Types.ObjectId},
      //     payment_status: {type:Number,default:0},
      let obj = {
        amount: getorders[0].totalSum ?? 0,
        distributor_id: req.user._id,
      };
      let findPayout = await payout.findOne({ distributor_id: req.user._id });
      if (!findPayout || findPayout.length == 0) {
        let insert = new payout(obj);
        await insert.save();
        res.send({ status: true, message: "Payout updated", data: insert });
      } else {
        findPayout.amount += obj.amount;
        await findPayout.save();
        res.send({ status: true, message: "Payout updated", data: findPayout });
      }
    }
  } catch (err) {
    console.log(err);
    res.send({ status: false, message: "something went wrong" });
  }
};

module.exports.search_distributor_list = async (req, res) => {
  try {
    let city = req.query.city;
    let findDistributor = await Distributor.aggregate([
      { $match: { city: city } }, // Apply the matching condition
      {
        $project: {
          id: 1, // Include the id field
          distributorcode: 1,
          name: { $concat: ["$firstname", " ", "$lastname"] }, // Concatenate firstname and lastname into a single field called name
        },
      },
    ]);
    if (!findDistributor || findDistributor.length == 0) {
      return res.send({ status: false, message: "data not found", data: null });
    }
    return res.send({
      status: false,
      message: "data fetched",
      data: findDistributor,
    });
  } catch (err) {
    console.log(err);
    res.send({ status: false, message: err.message, data: null });
  }
};

module.exports.distributor_get_product_retailer = async (req, res) => {
  try {
    let distributorId = req.query.distributor_id;
    let categoryId = req.query.category_id;
    const result = await Product.aggregate([
      {
        $match: {
          category_id: mongoose.Types.ObjectId(categoryId),
          "distributors.distributorId": distributorId,
        },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          name: "$title",
          distributor_name: { $first: "$distributors.distributorName" }, // Use $first to get the first element of the array
          price: { $first: "$distributors.price" }, // Use $first to get the first element of the array
        },
      },
    ]);
    if (!result || result.length == 0) {
      res.send({ status: false, message: "not found", data: null });
    } else {
      res.send({ status: true, message: "data fetched", product: result });
    }
  } catch (err) {
    console.log(err);
    res.send({ status: false, message: err.message, data: null });
  }
};

module.exports.distributor_reject = async (req, res) => {
  const distributorId = req.body.id;
  console.log("???????????????????????????????????????", distributorId);

  try {
    // Find the distributor based on distributorId
    const distributor = await Distributor.findOne({ _id: distributorId });

    if (!distributor) {
      // Check if the distributor was not found
      return res.status(404).json({ success: false, message: 'Distributor not found.' });
    }

    // Update the distributor to set verify to false
    distributor.verify = false;
    await distributor.save();

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", distributor);

    res.status(200).json({ success: true, message: 'Distributor Rejected successfully.', data: distributor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reject distributor.' });
  }
};

module.exports.inventory_download = async (req, res) => {
  const distributorId = req.user._id;
  console.log("IDS>>>>>>>>>>>>>>", distributorId);
  try {
    const results = await Product.aggregate([
      { $match: { "distributors.distributorId": distributorId } },
      {
        $project: {
          _id: 1,
          title: 1,
          sub_title: 1,
          distributors: {
            $filter: {
              input: "$distributors",
              as: "distributor",
              cond: { $eq: ["$$distributor.distributorId", distributorId] },
            },
          },
        },
      },
      { $unwind: "$distributors" },
      {
        $project: {
          _id: "$_id",
          name: "$title",
          subtitle: "$sub_title",
        },
      },
    ]);
    if (results.length > 0) {
      const responseData = results.map(item => ({
        _id: item._id.toString(),
        name: item.name,
        subtitle: item.subtitle,
      }));
      // console.log("RESULT", results._id);

      const workbook = new ExcelJS.Workbook();
      // console.log("Workbook created successfully");
      const worksheet = workbook.addWorksheet('MyInventory');

      worksheet.columns = [
        { header: 'Id', key: '_id', width: 40 },
        { header: 'Product Name', key: 'name', width: 40 },
        { header: 'Subtitle', key: 'subtitle', width: 70 },
        { header: 'price', key:'price', width: 40 },
        { header: 'stock', key:'stoke',width: 40 },
      ]; 
      // console.log("Worksheet columns", worksheet.columns);

      worksheet.addRows(responseData);
      // console.log("Response data", responseData[0]._id);

      // Example Content-Type header in the server response
      // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');


      res.setHeader('Content-Disposition', 'inline; filename=MyInventory.xlsx');
      const excelBuffer = await workbook.xlsx.writeBuffer();
      // console.log("new", excelBuffer);
      res.end(excelBuffer);
    } else {
      console.log('No matching document found.');
      return res.status(404).json({ status: true, message: 'empty' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};



// <<<<<<------------------------------Mongo services ------------------------------------------->>>
