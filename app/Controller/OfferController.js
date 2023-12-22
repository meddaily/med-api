const offer = require('../Models/Offer');
const response = require("../Common/common.js");
const mongodb = require("mongodb");
const fs = require("fs")
const multer = require("multer");
const { bucket } = require("../../firebase/firebase");
const { v4: uuidv4 } = require('uuid');

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      console.log(req.files);
      cb(null, "images/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
  })
});


// insert banner with admin panel
module.exports.addoffer = async (req, resp) => {
  try {
    // Check if the offer already exists
    let checkExist = await offer.findOne({
      product_id: req.body.product_id,
      distributor_id: req.body.distributor_id,
    });

    if (!checkExist) {
      // Upload image to the bucket
      const tempPath = 'tempfile.jpg';
      fs.writeFileSync(tempPath, Buffer.from(req.files[0].buffer));

      const imagePath = `${Date.now()}.png`;

      bucket.upload(tempPath, {
        destination: `addofferImage/${imagePath}`,
        metadata: {
          contentType: 'image/png',
          metadata: {
            firebaseStorageDownloadToken: uuidv4(),
          },
        },
      }, async (err, file) => {
        if (err) {
          console.log("?>>>>>>>>>", err);
          return resp.status(500).send({ status: false, message: "Internal Server Error" });
        }

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-3000',
        });

        // Create the offer object
        var obj = {
          name: req.body.name,
          product_name: req.body.product_name,
          product_id: req.body.product_id,
          distributor_id: req.body.distributor_id,
          image: url, // Use the correct URL obtained from the file upload
          type: req.body.type,
          value: req.body.type,
          activation_value: req.body.activation_value,
          bonus_quantity: req.body.bonus_quantity,
        };

        // Create the offer in the database
        offer.create(obj)
          .then((item) => {
            response.senddataResponse(resp, true, item, "Offer created successfully");
          })
          .catch((err) => {
            response.sendResponse(resp, false, err);
          });
      });
    } else {
      response.senddataResponse(resp, false, null, "Offer already exists");
    }
  } catch (error) {
    // Handle any errors that occur during the process
    resp.status(500).send({ status: false, message: "Internal Server Error" });
  }
};


// get banner for admin
module.exports.getoffer = async (req, resp) => {
  let obj;
  console.log(req.query);
  if (req.query.distributor_id && req.query.product_id) {
    obj = {
      distributor_id: req.query.distributor_id,
      product_id: req.query.product_id,
    };
  } else {
    obj = {};
  }
  offer
    .find(obj)
    .then((data) => {
      if (!data || data.length == 0) {
        response.sendResponse(resp, false, "Sorry, offer not found.");
      }
      response.senddataResponse(resp, data, true, "offer show Successfully.");
    })
    .catch((err) => {
      response.sendResponse(resp, false, err);
    });
};

// edit banner  show data in panel
module.exports.editoffer = async (req, resp) => {
  const data = await offer.find({ _id: req.params.id });
  if (!data || data.length == 0) {
    response.sendResponse(resp, false, "Sorry, offer not found.");
  }

  response.senddataResponse(resp, data, true, "offer show  Successfully.");
};

// update banner using panel
// module.exports.updateoffer = async (req, resp) => {
//   var obj;
//   if (req.file) {
//     var obj = {
//       name: req.body.name,
//       image: req.file.location,
//       type: req.body.type,
//     };
//   } else {
//     var obj = { name: req.body.name };
//   }

//   offer
//     .updateOne(
//       {
//         _id: new mongodb.ObjectId(req.body.id),
//       },
//       {
//         $set: obj,
//       }
//     )
//     .then((data) => {
//       if (data["acknowledged"] == true) {
//         resp.send({
//           status: true,
//           message: "offer update successfully",
//           data: data,
//         });
//       }
//     })
//     .catch((err) => {
//       response.sendResponse(resp, false, err);
//     });
// };
module.exports.updateoffer = async (req, resp) => {
  try {
    let obj;

    // Check if a new image is provided
    if (req.files && req.files.length > 0) {
      const tempPath = 'tempfile.jpg';
      fs.writeFileSync(tempPath, Buffer.from(req.files[0].buffer));

      const imagePath = `${Date.now()}.png`;

      bucket.upload(tempPath, {
        destination: `addofferImage/${imagePath}`,
        metadata: {
          contentType: 'image/png',
          metadata: {
            firebaseStorageDownloadToken: uuidv4(),
          },
        },
      }, async (err, file) => {
        if (err) {
          console.error(err);
          return resp.status(500).send({ status: false, message: "Internal Server Error" });
        }

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-3000',
        });

        obj = {
          name: req.body.name,
          image: url,
          type: req.body.type,
        };

        const data = await offer.updateOne(
          {
            _id: new mongodb.ObjectId(req.body.id),
          },
          {
            $set: obj,
          }
        );

        if (data.acknowledged) {
          return resp.send({
            status: true,
            message: "Offer updated successfully",
            data: data,
          });
        } else {
          return resp.status(500).send({ status: false, message: "Failed to update offer" });
        }
      });

    } else {
      // Handle the case where no new image is provided
      obj = { name: req.body.name, type: req.body.type };

      const data = await offer.updateOne(
        {
          _id: new mongodb.ObjectId(req.body.id),
        },
        {
          $set: obj,
        }
      );

      if (data.acknowledged) {
        return resp.send({
          status: true,
          message: "Offer updated successfully",
          data: data,
        });
      } else {
        return resp.status(500).send({ status: false, message: "Failed to update offer" });
      }
    }

  } catch (error) {
    console.error(error);
    return resp.status(500).send({ status: false, message: "Internal Server Error" });
  }
};



// delete banner
module.exports.deleteoffer = async (req, resp) => {

  // image delete 
  const olddata = await offer.findOne({ _id: req.params.id });
  // resp.send({data:olddata.image});
  if (olddata != null) {
    if (fs.existsSync("./images/" + olddata.image)) {
      fs.unlinkSync("./images/" + olddata.image);
    }

    const data = await offer.deleteOne(
      {
        _id: new mongodb.ObjectId(req.params.id)
      });
    if (data['acknowledged'] == true) {
      response.sendResponse(resp, true, "offer delete success");
    } else {
      response.sendResponse(resp, false, "some error found");
    }
  }
  else {
    response.sendResponse(resp, false, "banner not found")
  }
}






// <<<<<--------------------------- mongo services -------------------------->>>>>>>>>>>>>>>>>>>>>>>>>


