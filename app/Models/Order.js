// const mongoose = require('mongoose');

// var OrderSchema = mongoose.Schema(
//   {
//     order_id: { type: String, default: "" },
//     distributor_id: { type: mongoose.Schema.Types.ObjectId },
//     retailer_id: { type: mongoose.Schema.Types.ObjectId },
//     price: { type: Number, default: 0 },
//     products: [
//       {
//         id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//         name: String,
//         image: String,
//         price: Number,
//         batch_no: String,
//         exp_date: String,
//         quantity: Number,
//         tax:String,
//         return_quantity: { type: Number, default: 0 }
//       }
//     ],
//     batch_no: { type: String, default: "" },
//     exp_date: { type: String, default: "" },
//     bonus_quantity: { type: Number, default: 0 },
//     order_status: { type: Number, default: 4 },
//     return_status: { type: Number, default: 0 },
//     return_quantity: { Type: Number, default: 0 },
//     return_reason: { type: String, default: "" },
//     return_message: { type: String, default: "" },
//     return_image: { type: String, default: "" },
//     payment_status: { type: Number, default: 4 },
//     payment_type: { type: Number, default: 0 },
//     time: { type: Number, default: Date.now },
//     delivery_fee: { type: Boolean, default: false},
//     payment:{type:Boolean , default:false},
//     invoicenumber:{type:Number,default:function(){
//       return this.constructor.nextInvoiceNumber
//     }}
//   },
//   {
//     timestamps: true,
//   }
// );
// OrderSchema.pre('create', function (next) {
//   this.constructor.nextInvoiceNumber += 1;
//   next();
// });

// OrderSchema.statics.nextInvoiceNumber = 1;


// module.exports = mongoose.model('order', OrderSchema);



const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema(
  {
    order_id: { type: String, default: "" },
    distributor_id: { type: mongoose.Schema.Types.ObjectId },
    retailer_id: { type: mongoose.Schema.Types.ObjectId },
    price: { type: Number, default: 0 },
    products: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        price: Number,
        batch_no: String,
        exp_date: String,
        quantity: Number,
        tax: String,
        return_quantity: { type: Number, default: 0 }
      }
    ],
    batch_no: { type: String, default: "" },
    exp_date: { type: String, default: "" },
    bonus_quantity: { type: Number, default: 0 },
    order_status: { type: Number, default: 4 },
    return_status: { type: Number, default: 0 },
    return_quantity: { Type: Number, default: 0 },
    return_reason: { type: String, default: "" },
    return_message: { type: String, default: "" },
    return_image: { type: String, default: "" },
    payment_status: { type: Number, default: 4 },
    payment_type: { type: Number, default: 0 },
    time: { type: Number, default: Date.now },
    delivery_fee: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    invoicenumber: { type: Number, default:2323}
  },
  {
    timestamps: true,
  }
);

// OrderSchema.pre('save', async function (next) {
//   try {
//     // Find the maximum invoice number in the collection
    
//     const maxInvoiceNumber = await this.constructor.findOne().sort('-invoicenumber').exec();
//     console.log('Inside the ',maxInvoiceNumber)

//     // Increment the next invoice number
//     if (maxInvoiceNumber) {
//       const numericPart = parseInt(maxInvoiceNumber.invoicenumber.slice(-3), 10);
//       console.log(numericPart,"newericpart");
//       this.constructor.nextInvoiceNumber = numericPart + 1;
//       console.log("constructor",this.constructor.nextInvoiceNumber);
//     } else {
//       // If no orders exist, start with 1
//       this.constructor.nextInvoiceNumber = 1;
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// OrderSchema.statics.nextInvoiceNumber = 1;

module.exports = mongoose.model('Order', OrderSchema);