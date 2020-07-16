const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stationSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
	latitude: {
		type: String,
		required: true,
	},
	longitude: {
		type: String,
		required: true,
	},
	petrol: {
		type: Number,
		required: true,
	},
	diesel: {
		type: Number,
		required: true,
	},
	petrolAmount: {
		type: Number,
		required: true,
	},
	dieselAmount: {
		type: Number,
		required: true,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

module.exports = mongoose.model('Station', stationSchema);
