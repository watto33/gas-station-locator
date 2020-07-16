const express = require('express');

const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, isAdmin, adminController.getAddProduct);

router.get('/add-station', isAuth, isAdmin, adminController.getAddStation);

// /admin/products => GET
router.get('/products', isAuth, isAdmin, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, isAdmin, adminController.postAddProduct);

router.post('/add-station', isAuth, isAdmin, adminController.postAddStation);

router.get(
	'/edit-product/:productId',
	isAuth,
	isAdmin,
	adminController.getEditProduct
);

router.get(
	'/edit-station/:productId',
	isAuth,
	isAdmin,
	adminController.getEditStation
);

router.post('/edit-product', isAuth, isAdmin, adminController.postEditProduct);

router.post('/edit-station', isAuth, isAdmin, adminController.postEditStation);

router.post(
	'/delete-product',
	isAuth,
	isAdmin,
	adminController.postDeleteProduct
);

router.post(
	'/delete-station',
	isAuth,
	isAdmin,
	adminController.postDeleteStation
);

module.exports = router;
