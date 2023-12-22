const category = require('../Models/Category.js');
const response = require("../Common/common.js");
const mongodb = require("mongodb");
const fs = require("fs")
// const multer = require("multer");
const { bucket } = require("../../firebase/firebase");
const { v4: uuidv4 } = require('uuid');


// insert category with admin panel
module.exports.addcategory = async (req, resp) => {
  try {
    // console.log(">>>>>>>>>>>>>>>>>>", req.files);
    const tempPath = 'tempfile.jpg';
    fs.writeFileSync(tempPath, Buffer.from(req.files[0].buffer));
    
    // Use a unique name for the image, for example, based on timestamp
    const imagePath = `${Date.now()}.png`;

    bucket.upload(tempPath, {
      destination: `CategoryImages/${imagePath}`,
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

      const obj = {
        name: req.body.name,
        image: url,
      };

      // Assuming `category` is your model for storing categories
      category.create(obj)
        .then((item) => {
          fs.unlinkSync(tempPath); // Remove the temporary file
          response.senddataResponse(resp, true, item, "Category create successful");
        })
        .catch((err) => {
          fs.unlinkSync(tempPath); // Remove the temporary file in case of an error
          response.sendResponse(resp, false, err);
        });
    });
  } catch (err) {
    console.log(err);
    resp.status(500).send({ status: false, message: "Internal Server Error" });
  }
};


// get category for admin
module.exports.getcategory = async (req, resp) => {
  try {
    category.find().then(data => {
      if (!data || data.length == 0) {
        response.sendResponse(resp, false, "Sorry, categories not found.");
      }
      response.senddataResponse(resp, data, false, "categories show Successfully.");
    }).catch(err => {
      response.sendResponse(resp, false, err);
    });
  }
  catch (err) {
    response.sendResponse(resp, false, err);
  }
}





// edit category  show data in panel 
module.exports.editcategory = async (req, resp) => {

  const data = await category.find({ _id: req.params.id });
  if (!data || data.length == 0) {
    response.sendResponse(resp, false, "Sorry, category not found.");
  }

  response.senddataResponse(resp, data, true, "category show  Successfully.");

}

// update category using panel 
module.exports.updatecategory = async (req, resp) => {
  upload.single('image')(req, resp, function (error) {
    var obj;
    if (req.file) {

      var obj = { name: req.body.name, image: req.file.filename }
    }
    else {
      var obj = { name: req.body.name }
    }

    category.updateOne(
      {
        _id: new mongodb.ObjectId(req.body.id)
      },
      {
        $set: obj
      }).then(data => {
        if (data['acknowledged'] == true) {
          resp.send({ status: true, message: "item update successfully" });
        }
      }).catch(err => {
        response.sendResponse(resp, false, err);
      })



  });

};


// delete category 
module.exports.deletecategory = async (req, resp) => {

  // image delete 
  const olddata = await category.findOne({ _id: req.params.id });
  // resp.send({data:olddata.image});
  if (olddata != null) {
    if (fs.existsSync("./images/" + olddata.image)) {
      fs.unlinkSync("./images/" + olddata.image);
    }

    const data = await category.deleteOne(
      {
        _id: new mongodb.ObjectId(req.params.id)
      });
    if (data['acknowledged'] == true) {
      response.sendResponse(resp, true, "category delete success");
    } else {
      response.sendResponse(resp, false, "some error found");
    }
  }
  else {
    response.sendResponse(resp, false, "category not found")
  }



}






// <<<<<--------------------------- mongo services -------------------------->>>>>>>>>>>>>>>>>>>>>>>>>



function getprovidesData(req, image) {
  let request = req.body;
  const new_user = new category({
    image: image,
    name: request.name,
  });
  return new_user;
}
