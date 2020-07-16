const Product = require('../models/product');
const Station = require('../models/station');
const Order = require('../models/order');
const Cart = require('../models/cart');
const Checkout = require('../models/checkout');
const stripe = require('stripe')(
	'sk_test_51H4kbbCG8zCedipoa5UUpNrlJOvknjSZoa1GujW3c4tfRnupLv71wY4lUUcTUvTTGvY0jYLzcgSWK47UO5o4HSD800veNsUDn6',
);

exports.getProducts = (req, res, next) => {
	Station.find()
		.then(products => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
				isAuthenticated: req.session.isLoggedIn,
				isAdmin: req.session.isAdmin,
				userName: req.session.userName,
			});
		})
		.catch(err => {
			console.log(err);
		});
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Station.findById(prodId)
		.then(product => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products',
				isAuthenticated: req.session.isLoggedIn,
				userName: req.session.userName,
				isAdmin: req.session.isAdmin,
			});
		})
		.catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
	Product.find()
		.then(products => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
				isAuthenticated: req.session.isLoggedIn,
				userName: req.session.userName,
				isAdmin: req.session.isAdmin,
			});
		})
		.catch(err => {
			console.log(err);
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then(user => {
			const products = user.cart.items;
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: products,
				isAuthenticated: req.session.isLoggedIn,
				userName: req.session.userName,
				isAdmin: req.session.isAdmin,
			});
		})
		.catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Station.findById(prodId)
		.then(product => {
			return req.user.addToCart(product);
		})
		.then(result => {
			res.redirect('/cart');
		});
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then(result => {
			res.redirect('/cart');
		})
		.catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate('cart.items.productId')
		.execPopulate()
		.then(user => {
			const products = user.cart.items.map(i => {
				return { quantity: i.quantity, product: { ...i.productId._doc } };
			});
			const order = new Order({
				user: {
					email: req.user.email,
					userId: req.user,
				},
				products: products,
			});
			return order.save();
		})
		.then(result => {
			return req.user.clearCart();
		})
		.then(() => {
			res.redirect('/orders');
		})
		.catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
	Checkout.remove({}, () => {
		Order.find({ 'user.userId': req.user._id })
			.then(orders => {
				res.render('shop/orders', {
					path: '/orders',
					pageTitle: 'Your Orders',
					orders: orders,
					isAuthenticated: req.session.isLoggedIn,
					userName: req.session.userName,
					isAdmin: req.session.isAdmin,
				});
			})
			.catch(err => console.log(err));
	});
};

exports.getCheckoutSuccess = (req, res, next) => {
	Cart.find({ 'user.userId': req.user._id }).then(orders => {
		const products = {
			product: {
				petrol: +orders[0].products[0].product.petrol,
				diesel: +orders[0].products[0].product.diesel,
			},
		};

		const product = new Order({
			user: {
				email: req.user.email,
				userId: req.user,
			},
			products: products,
		});

		product.save().then(doc => {
			res.redirect('/orders');
		});
	});
};

exports.postCo = (req, res, next) => {
	const products = {
		product: {
			petrol: req.body.petrol,
			diesel: req.body.diesel,
			petrolAmount: req.body.petrolAmount,
			dieselAmount: req.body.dieselAmount,
		},
	};
	const checkoutPetrol = {
		name: 'Petrol',
		amount: req.body.petrolAmount,
		quantity: req.body.petrol,
	};
	const checkoutDiesel = {
		name: 'Diesel',
		amount: req.body.dieselAmount,
		quantity: req.body.diesel,
	};

	const checkoutBag = [checkoutPetrol, checkoutDiesel];
	Checkout.collection
		.insert(checkoutBag)
		.then(() => {
			Cart.find({ 'user.userId': req.user._id }).then(order => {
				if (order.length === 0) {
					const cart = new Cart({
						user: {
							email: req.user.email,
							userId: req.user,
						},
						products: products,
					});
					return cart
						.save()
						.then(() => {
							res.redirect('/checkout');
						})
						.catch(err => console.log(err));
				}
				order[0].products = products;
				return order[0].save().then(() => {
					res.redirect('/checkout');
				});
			});
		})

		.catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
	let total = 0;
	let docs;
	Cart.find({ 'user.userId': req.user._id })
		.then(orders => {
			total =
				+orders[0].products[0].product.petrol *
					+orders[0].products[0].product.petrolAmount +
				+orders[0].products[0].product.diesel *
					+orders[0].products[0].product.dieselAmount;
			docs = orders[0].products;
			Checkout.find()
				.exec()
				.then(docs => {
					return stripe.checkout.sessions.create({
						payment_method_types: ['card'],
						line_items: docs.map(p => {
							if (+p.quantity == 0) {
								p.quantity = 1;
								p.amount = 0.01;
							}
							return {
								name: p.name,
								amount: +p.amount * 100,
								currency: 'inr',
								quantity: +p.quantity,
							};
						}),
						mode: 'payment',
						success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
						cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
					});
				})
				.then(session => {
					res.render('shop/checkout', {
						path: '/checkout',
						pageTitle: 'Checkout',
						products: docs,
						isAuthenticated: req.session.isLoggedIn,
						userName: req.session.userName,
						isAdmin: req.session.isAdmin,
						totalPrice: parseFloat(total.toFixed(2)),
						sessionId: session.id,
					});
				});
		})

		.catch(err => console.log(err));
};
