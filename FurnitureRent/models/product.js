const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ProductSchema = new Schema({
    title : String,
    price : Number,
    material : String,
    color : [String],
    dimention : String,
    storage : Boolean,
    description : String,
    category : String,
    stock : Number,
    images : [{
        url : String,
        filename : String
    }],
    reviews : [{
        type : Schema.Types.ObjectId,
        ref : 'Review'
    }]
}); 

ProductSchema.post('findOneAndDelete',async function (doc){
    if (doc) {
        await Review.deleteMany({
            _id : {
                $in : doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("products",ProductSchema);