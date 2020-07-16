const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const checkoutSchema = new Schema({
	// products: [
	// 	{
	// 		product: { type: Object, required: true },
	// 		// quantity: { type: Number, required: true },
	// 	},
	// ],
	// user: {
	// 	email: {
	// 		type: String,
	// 		required: true,
	// 	},
	// 	userId: {
	// 		type: Schema.Types.ObjectId,
	// 		required: true,
	// 		ref: 'User',
	// 	},
	// },
	name: String,
	amount: Number,
	quantity: Number,
});

module.exports = mongoose.model('Checkout', checkoutSchema);
