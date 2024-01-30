
const Admin = require('../Models/Admin.js');
const response = require("../Common/common.js");
const jwt = require("jsonwebtoken");
const Order = require('../Models/Order');
const Payout = require('../Models/payout');
const token = require("../Models/token");
const Distributor = require("../Models/Distributor");
const Retailer = require("../Models/Retailer");
const OTPModel = require('../Models/Otp.js');
const UserModel = require('../Models/user.js');
const ExcelJS = require('exceljs');

//-------------------------------  Admin Login ---
exports.signup = async (req, res) => {
  const { email } = req.body;
  Admin.findOne({ email: email }).then((check) => {
    if (!check || check.length == 0) {
      //new Insert Admin
      const adminData = getAdminData(req);
      response.sendResponse(
        res,
        "success",
        "Your account has been created successfully."
      );
    } else {
      response.sendResponse(
        res,
        "fail",
        "Sorry,Email already exists please choose a different one."
      );
    }
  });
};

//-------------------------------  Admin SIGNUP ---
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    await Admin.findOne({ email: email }).then((check) => {
      if (!check || check.length == 0) {
        response.sendResponse(
          res,
          "fail",
          "Sorry,The email address you entered were invalid."
        );
      } else {
        check.comparePassword(password, function (err, isMatch) {
          var token = jwt.sign({ user_id: check._id }, "Secret", {
            expiresIn: "1h",
          });
          if (isMatch === true) {
            return res.send({
              data: check,
              token: token,
              status: true,
              message: "Successfully Login",
            });
            // response.senddataResponse(res,check,true,"Successfully log in");
          } else {
            response.sendResponse(
              res,
              "fail",
              "Sorry, The email address or password you entered were invalid"
            );
          }
        });
      }
    });
  } else {
    return responses.sendResponse(
      res,
      "fail",
      "Sorry json parameter are missing."
    );
  }
};

// module.exports.all_order = async (req, res) => {
//   await Order.find({ return_status: 0 })
//     .sort({ createdAt: -1 })
//     .then(async (item) => {
//       const mappedResults = await Promise.all(
//         item.map(async (e) => {
//           let distributerName = await Distributor.findOne({
//             _id: e.distributor_id,
//           });
//           let retailerName = await Retailer.findOne({
//             _id: e.retailer_id,
//           });
//           console.log("??????????????????????????distributerName???????????????????????????????", distributerName?.firstname);
//           e._doc.distributor_name =
//           distributerName?.firstname + " " + distributerName?.lastname;
//           e._doc.retailer_name = retailerName?.ownername;
//           return e;
//         })
//       );
//       res.json({ status: "success", key:mappedResults.length,data: mappedResults });
//     })
//     .catch((err) => {
//       res.status(500).json({ status: "fail", error: err.message });
//     });
// };
module.exports.all_order = async (req, res) => {
  try {
    
    const startDate = req.query.startDate;
    console.log("startdate", new Date(startDate));
    const endDate = req.query.endDate;
    console.log("enddate", new Date(endDate));

    let obj = {};
    if (!startDate && !endDate) {
      obj ;
    } else {
      obj = {
       
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }
    const orders = await Order.find(obj).sort({ createdAt: -1 });
    // console.log(orders,"obj");

    const mappedResults = await Promise.all(
      orders.map(async (e) => {
        let distributerName = await Distributor.findOne({ _id: e.distributor_id });
        let retailerName = await Retailer.findOne({ _id: e.retailer_id });

        // console.log("??????????????????????????distributerName???????????????????????????????", distributerName);

        // Check if distributerName is defined before accessing its properties

        e._doc.distributor_name = distributerName?.firstname
        e._doc.retailer_name = retailerName?.ownername;
        return e;
      })
    );

    res.json({ status: "success", key: mappedResults.length, data: mappedResults });
  } catch (err) {
    res.status(500).json({ status: "fail", error: err.message });
  }
};



module.exports.order_status_change = async (req, res) => {
  const { order_id, status } = req.body;
  await Order.findOneAndUpdate(
    { _id: order_id },
    { order_status: status },
    { new: true }
  )
    .then((item) => {
      response.sendResponse(res, "success", item);
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.order_detail = async (req, res) => {
  const { order_id } = req.body;
  await Order.findOne({ _id: order_id })
    .then(async (item) => {
      let distributerName = await Distributor.findOne({
        _id: item.distributor_id,
      });
      console.log(distributerName, "DINAME");
      console.log(item, "item");
      let retailerName = await Retailer.findOne({
        _id: item.retailer_id,
      });
      // console.log(retailerName,"RINAME");

      item.distributor_name =
        distributerName?.firstname + " " + distributerName?.lastname;
      item.retailer_name = retailerName?.ownername;
      item.billing_address = `${retailerName?.address} ${retailerName?.city}, ${retailerName?.area} ${retailerName?.state}, ${retailerName?.pincode}`;
      // console.log("ITEM",item.retailer_name);

      response.sendResponse(res, {
        status: "success",
        data: { ...item._doc, distributor_name: item.distributor_name, retailer_name: item.retailer_name, billing_address: item.billing_address },
      });
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.return_order_request = async (req, res) => {
  res.send("Nothing here");
};
module.exports.return_order_accepted = async (req, res) => {
  await Order.updateOne({ order_id: req.query.order_id }, { return_status: 3 })
    .then((result) => {
      res.send({
        status: true,
        message: "order return get success",
        data: result,
      });
    })
    .catch((err) => {
      res.send({ status: false, message: err });
      console.log(err);
    });
};
module.exports.get_all_return_delivered_order = async (req, res) => {
  await Order.findOne({ return_status: "delivered" })
    .sort({ createdAt: -1 })
    .then((item) => {
      res.send({
        status: true,
        message: "order accepted get success",
        data: item,
      });
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.return_order_deliver = async (req, res) => {
  const { order_id } = req.body;
  await Order.findOneAndUpdate({ _id: order_id }, { return_status: 3 })
    .then((item) => {
      res.send({ status: true, message: "deliver success" });
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};
const payout_transactions = require("../Models/payout_transaction");

module.exports.all_payout_request = async (req, res) => {
  if (req.params.id == "All") {
    var obj = {};
  } else {
    var obj = { payment_status: req.params.id };
  }
  console.log("?????????MMMMMMMMMMMMMMMMMMMMMM", obj);
  await payout_transactions
    .find(obj).populate('distributor_id')
    .sort({ createdAt: -1 })
    .then((item) => {
      response.sendResponse(res, "success", item);
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.accept_payout = async (req, res) => {
  const { payout_id } = req.body;
  await payout_transactions
    .findOneAndUpdate({ _id: payout_id }, { $set: { payment_status: 2 } })
    .then((result) => {
      console.log(result);
      res.send({ status: true, message: "payout success" });
    })
    .catch((err) => {
      response.sendResponse(res, "fail", err);
    });
};

module.exports.change_order_status = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
};

module.exports.get_return_admin = async (req, res) => {
  try {
    let obj = {};
    if (!req.query.from && !req.query.to) {
      obj = {
        return_status: { $gt: 1 },
      };
    } else {
      obj = {
        return_status: { $gt: 1 },
        createdAt: {
          $gte: req.query.from,
          $lte: req.query.to,
        },
      };
    }
    console.log(obj);
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
        console.log(err);
        res.send({ status: false, message: "data fetch failed", data: null });
      });
  } catch (err) {
    console.log(err);
  }
};

const Product = require("../Models/Product");

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


        let distributerName = await Distributor.findOne({
          _id: result.distributor_id,
        });
        let retailerName = await Retailer.findOne({
          _id: result.retailer_id,
        });
        result._doc.distributor_name =
          distributerName?.firstname + " " + distributerName?.lastname;
        result._doc.distributor_address =
          distributerName?.city +
          " " +
          distributerName?.area +
          " " +
          distributerName?.state;
        result._doc.retailer_name = retailerName?.ownername;
        result._doc.retailer_address = retailerName?.address;
        // result._doc.item_total = totalAmount;
        // result._doc.Tax = (totalAmount * getProductTax?.applicable_tax) / 100;
        // result._doc.delivery_fee = 100;
        // result._doc.order_total =
        // result._doc.item_total + result._doc.Tax + result._doc.delivery_fee;
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

const Invoice = require("../Models/invoice");
const { retailer_detail } = require('./RetailerController.js');
module.exports.get_invoice = async (req, res) => {
  try {
    let order_id = req.query.order_id;
    let findinvoice = await Invoice.find({ order_id: order_id });
    if (!findinvoice || findinvoice.length == 0)
      return res.send({ status: false, message: "No data found" });
    res.send({ status: true, message: "invoice fetched", data: findinvoice });
  } catch (err) {
    console.log(err);
  }
};

//Operation
async function getAdminData(req) {
  let request = req.body;
  const new_admin = new Admin({
    email: request.email,
    password: request.password
  });

  const InsertNew = await new_admin.save();
  return InsertNew;
}

function getOrderStatus(code) {
  if (code === 0) {
    return "Order Cancelled";
  } else if (code === 1) {
    return "Order Shipped";
  } else if (code === 3) {
    return "Order Delivered";
  } else if (code === 4) {
    return "Order Placed";
  } else if (code === 5) {
    return "Order Return";
  }
}
function getPaymentType(paymentType) {
  switch (paymentType) {
    case 1:
      return "COD";
    case 3:
      return "On Credit";
    case 2:
      return "Prepaid";
    default:
      return "";
  }
}

module.exports.get_all_report = async (req, res) => {
  try {
    const type = req.query.type
    console.log(type, "type");
    const value = req.query.value
    console.log(value, "value");


    const data = await Order.find({
      [type]: value,
  
    });
    // console.log(data,"DELIVERYFEE");
    // return res.send(data)

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Order Data');

    worksheet.columns = [
      { header: 'ORDER ID', key: 'order_id', width: 40 },
      { header: 'RETAILER NAME', key: 'retailer_name', width: 40 },
      { header: 'DISTRIBUTOR NAME', key: 'distributor_name', width: 40 },
      { header: 'TOTAL PRICE', key: 'price', width: 40 },
      { header: 'STATUS', key: 'order_status', width: 40 },
      { header: 'PAYMENT TYPE', key: 'payment_type', width: 40 },
    ];
    for (const order of data) {

      const retailer = await Retailer.findById(order.retailer_id);
      const distributor = await Distributor.findById(order.distributor_id);

      worksheet.addRow({
        order_id: order.order_id,
        retailer_name: retailer ? retailer.ownername : '',
        distributor_name: distributor ? distributor.firstname + " " + distributor.lastname : "",
        price: order.price,
        order_status: getOrderStatus(order.order_status),
        payment_type: getPaymentType(order.payment_type),
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=DeliveryFeeData.xlsx');

    const excelBuffer = await workbook.xlsx.writeBuffer();

    res.end(excelBuffer);
  } catch (error) {
    return res.status(500).send("Internal server error")
  }
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++OTP FLOW__________________________


module.exports.get_otp = async (req, res) => {
  try {

    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("OTP", otp);
    const email = req.body.email;
    console.log("EMAIL", req.body.email);

    await OTPModel.create({ email, otp });


    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.get_user = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await OTPModel.findOne({ email });

    if (user) {

      var token = jwt.sign({ userId: user._id, email: user.email }, "Secret", {
        expiresIn: "1h",
      });
      return res.status(200).json({ message: 'User logged in successfully.', token });
    } else {

      const newUser = await UserModel.create({ email });
      var token = jwt.sign({ userId: newUser._id, email: newUser.email }, "Secret", {
        expiresIn: "1h",
      });
      return res.status(201).json({ message: 'User created and logged in successfully.', token });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports.update_profile = async (req, res) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Token not found' });
    }

    jwt.verify(token, 'Secret', async (err, decoded) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ error: 'Forbidden - Invalid token' });
      }

      const { userId, email } = decoded;

      try {

        const user = await UserModel.findById(userId);

        if (!user || user.email !== email) {
          return res.status(403).json({ error: 'Forbidden - User not authorized' });
        }

        user.email = req.body.email;
        user.RegisteredDate = req.body.RegisteredDate;
        user.KycStatus = req.body.KycStatus;
        user.EmailStatus = req.body.EmailStatus;
        user.UserStatus = req.body.UserStatus
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully.' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// const axios = require('axios');

// module.exports.get_otp = async (req, res) => {
//   try {
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     const email = req.body.email;

//     // Save the OTP in your database, assuming OTPModel is your database model
//     await OTPModel.create({ email, otp });

//     // Replace the following with the actual API key and API endpoint
//     const apiKey = 'http://localhost:8000/';
//     const emailSendingAPI = 'https://api.emailservice.com/send';

//     // Replace with your actual email content and formatting
//     const emailContent = `Your OTP is: ${otp}`;

//     // Send the email via the external API
//     const response = await axios.post(emailSendingAPI, {
//       apiKey,
//       to: email,
//       subject: 'OTP for verification',
//       body: emailContent,
//     });

//     if (response.status === 200) {
//       res.status(200).json({ message: 'OTP sent successfully.' });
//     } else {
//       console.error(response.data);
//       res.status(500).json({ error: 'Failed to send OTP.' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };