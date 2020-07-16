const Product = require('../models/product');
const Station = require('../models/station');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		userName: req.session.userName,
		isAdmin: req.session.isAdmin,
	});
};

exports.getAddStation = (req, res, next) => {
	res.render('admin/edit-station', {
		pageTitle: 'Add Station',
		path: '/admin/add-station',
		editing: false,
		userName: req.session.userName,
		isAdmin: req.session.isAdmin,
	});
};

exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: imageUrl,
		userId: req.user,
	});
	product
		.save()
		.then(result => {
			// console.log(result);
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch(err => {
			console.log(err);
		});
};

exports.postAddStation = (req, res, next) => {
	const name = req.body.name;
	const imageUrl = req.body.imageUrl;
	const latitude = req.body.latitude;
	const longitude = req.body.longitude;
	const address = req.body.address;
	const petrol = req.body.petrol;
	const petrolAmount = req.body.petrolAmount;
	const diesel = req.body.diesel;
	const dieselAmount = req.body.dieselAmount;
	const station = new Station({
		name: name,
		address: address,
		imageUrl: imageUrl,
		latitude: latitude,
		longitude: longitude,
		petrol: petrol,
		petrolAmount: petrolAmount,
		diesel: diesel,
		dieselAmount: dieselAmount,
		userId: req.user,
	});
	station
		.save()
		.then(result => {
			// console.log(result);
			console.log('Created Gas Station');
			res.redirect('/admin/products');
		})
		.catch(err => {
			console.log(err);
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then(product => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product: product,
				userName: req.session.userName,
				isAdmin: req.session.isAdmin,
			});
		})
		.catch(err => console.log(err));
};

exports.getEditStation = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	Station.findById(prodId)
		.then(station => {
			if (!station) {
				return res.redirect('/');
			}
			res.render('admin/edit-station', {
				pageTitle: 'Edit Station',
				path: '/admin/edit-station',
				editing: editMode,
				product: station,
				userName: req.session.userName,
				isAdmin: req.session.isAdmin,
			});
		})
		.catch(err => console.log(err));
};

exports.postEditStation = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedName = req.body.name;
	const updatedImageUrl = req.body.imageUrl;
	const updatedLatitude = req.body.latitude;
	const updatedLongitude = req.body.longitude;
	const updatedAddress = req.body.address;
	const updatedPetrol = req.body.petrol;
	const updatedPetrolAmount = req.body.petrolAmount;
	const updatedDiesel = req.body.diesel;
	const updatedDieselAmount = req.body.dieselAmount;

	Station.findById(prodId)
		.then(station => {
			if (station.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			station.name = updatedName;
			station.imageUrl = updatedImageUrl;
			station.address = updatedAddress;
			station.latitude = updatedLatitude;
			station.longitude = updatedLongitude;
			station.petrol = updatedPetrol;
			station.petrolAmount = updatedPetrolAmount;
			station.diesel = updatedDiesel;
			station.dieselAmount = updatedDieselAmount;
			return station.save().then(result => {
				console.log('UPDATED PRODUCT!');
				res.redirect('/admin/products');
			});
		})
		.catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImageUrl = req.body.imageUrl;
	const updatedDesc = req.body.description;

	Product.findById(prodId)
		.then(product => {
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			product.imageUrl = updatedImageUrl;
			return product.save().then(result => {
				console.log('UPDATED PRODUCT!');
				res.redirect('/admin/products');
			});
		})
		.catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
	Station.find({ userId: req.user._id })
		// .select('title price -_id')
		// .populate('userId', 'name')
		.then(stations => {
			res.render('admin/products', {
				prods: stations,
				pageTitle: 'Admin Gas Stations',
				path: '/admin/products',
				userName: req.session.userName,
				isAdmin: req.session.isAdmin,
			});
		})
		.catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.deleteOne({ _id: prodId, userId: req.user._id })
		.then(() => {
			console.log('DESTROYED PRODUCT');
			res.redirect('/admin/products');
		})
		.catch(err => console.log(err));
};

exports.postDeleteStation = (req, res, next) => {
	const prodId = req.body.productId;
	Station.deleteOne({ _id: prodId, userId: req.user._id })
		.then(() => {
			console.log('DESTROYED PRODUCT');
			res.redirect('/admin/products');
		})
		.catch(err => console.log(err));
};
