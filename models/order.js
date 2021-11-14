const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderItems: [
        {
            type: Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true,
        },
    ],
    shippingAddress: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrderd: {
        type: Date,
        default: Date.now,
    },
});

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Order', orderSchema);

/*
 {
     "orderItems":[
         {
             "quantity": 3,
             "product": "61901c6aa01d1864917ea7fc"
         },
         {
             "quantity": 2,
             "product": "6190f753ca5ddb98b656169f"
         }
     ],
     "shippingAddress": "Flowers St., 45",
     "shippingAddress2": "1-B",
     "city": "Prague",
     "zip": "0000",
     "country": "Czech Republic",
     "phone": "+183766334234",
     "user": "6190ebd4fecaa8d18ca82639"
 }
---------------------
 {
     "orderItems":[
         {
             "quantity": 5,
             "product": "61901c6aa01d1864917ea7fc"
         },
         {
             "quantity": 3,
             "product": "6190f753ca5ddb98b656169f"
         }
     ],
     "shippingAddress": "Flowers St., 9",
     "shippingAddress2": "31-B",
     "city": "Praguelo",
     "zip": "30000",
     "country": "Czech Republic",
     "phone": "+183766334234",
     "user": "6190ebd4fecaa8d18ca82639"
 }
 */
