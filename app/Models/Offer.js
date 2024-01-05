const mongoose = require('mongoose');

var OfferSchema = mongoose.Schema(
  {
    image: String,
    // product_name: String,
    distributor_id: String,
    product_id: String,
    name: String,
    type: String,
    purchase_quantity: Number,
    bonus_quantity: Number,
    time: { type: Number, default: Date.now },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('offer', OfferSchema);