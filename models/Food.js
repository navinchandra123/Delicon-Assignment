const mongoose = require('mongoose');
const FoodSchema = new mongoose.Schema({
    name:{type:String , required:true},
    category:{type:String , required:true},
    price:{type:String , required:true},
    date: {
        type: Date,
        default: Date.now
    }
});
  
const Food = mongoose.model('Food' , FoodSchema);
module.exports = Food;