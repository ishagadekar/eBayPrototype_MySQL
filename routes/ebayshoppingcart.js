var ejs = require('ejs');
var mysql = require('./mysql');
var logger = require('./logger');

exports.displayShoppingCart = function(req, res) {
	ejs.renderFile('./views/ebayshoppingcart.ejs', function(err, result) {
		if (!err) {
			logger.log("info", "Displaying shopping cart page for user with id = " + req.session.user.user_id);
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying shopping cart page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.getCartDetails = function(req, res) {

	var json_response;

	if (req.session.user) {
		logger.log("info", "Shopping cart icon clicked by user. Fetching shopping cart details for user with id = " + req.session.user.user_id);
		
		var query = "select * from shoppingcart where userId="
				+ req.session.user.user_id;
		console.log(query);
		logger.log("info", "Executing query = " + query);

		mysql.fetchData2(function(err, results) {
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query);
				throw err;
			} else {
				if (results.length > 0) {
					logger.log("info", "Shopping cart items fetched successfully for user with id = " + req.session.user.user_id);
					var idArray = [];
					var quantities = [];
					for (var i = 0; i < results.length; i++) {
						idArray[i] = (results[i].itemId);
						quantities[i] = (results[i].quantitybought);
					}
					var query1 = "select * from itemsforsale where id in ("
							+ idArray.join() + ")";
					console.log("Query is : " + query1);
					logger.log("info", "Executing query = " + query1);
					
					mysql.fetchData2(function(err, results) {
						if (err) {
							logger.log("error", "Error occurred while executing query = " + query1);
							throw err;
						} else {
							logger.log("info", "Shopping cart item details fetched successfully for user with id = " + req.session.user.user_id);
							for (var i = 0; i < results.length; i++) {
								results[i].quantity = quantities[i];
							}
							json_response = {
								"statuscode" : 200,
								"user" : req.session.user,
								"cartItems" : results
							};
							res.send(json_response);
						}
					}, query1);
				} else {
					logger.log("info", "Shopping cart empty for user with id = " + req.session.user.user_id);
					json_response = {
						"statuscode" : 401,
						"user" : req.session.user
					};
					res.send(json_response);
				}
			}
		}, query);
	} else {
		res.redirect('/');
	}

};

exports.saveCart = function(req, res) {

	var json_response;

	var query = "select * from shoppingcart where userId=" + req.param("userId") + " and itemId=" + req.param("itemId");
	logger.log("info", "Executing query = " + query);
	
	if (req.session.user) {
		logger.log("info", "Add to cart button clicked by user. Saving shopping cart details for user with id = " + req.session.user.user_id);
		mysql.fetchData2(function(err, results) {
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query);
				throw err;
			} else {
				if(results.length > 0) {
					logger.log("info", "Updating quantity in user's cart for item with id = " + req.param("itemId") + 
							" as cart already contains it for user with id = " + req.session.user.user_id);
					var query3 = "update shoppingcart set quantitybought=quantitybought+" + req.param("quantityBought") 
					+ " where userId=" + req.param("userId") + " and itemId=" + req.param("itemId");
					console.log("Query is : " + query3);
					logger.log("info", "Executing query = " + query3);
					
					mysql.fetchData2(function(err, results) {
						if (err) {
							logger.log("error", "Error occurred while executing query = " + query3);
							throw err;
						} else {
							logger.log("info", "Updating quantity in itemsforsale table for item with id = " + req.param("itemId") + 
									" to reflect item added to cart for user with id = " + req.session.user.user_id);
							var query4 = "update itemsforsale set quantity=quantity-" + req.param("quantityBought") + " where id=" + req.param("itemId");
							console.log("Query is : " + query4);
							logger.log("info", "Executing query = " + query4);
							
							mysql.fetchData2(function(err, results) {
								if (err) {
									logger.log("error", "Error occurred while executing query = " + query4);
									throw err;
								} else {
									console.log("Query for updating quantity for same cart item executed successfully!");
								}
							}, query4);
							
							json_response = {
									"statuscode" : 200,
									"user" : req.session.user,
								};
								res.send(json_response);
						}
					}, query3);
					
				} else {
					logger.log("info", "Inserting new cart item for user with id = " + req.session.user.user_id);
					var query1 = "insert into shoppingcart values(" + req.param("userId") + ","
					+ req.param("itemId") + "," + req.param("quantityBought") + ")";
					console.log("Query is : " + query1);
					logger.log("info", "Executing query = " + query1);
	
					mysql.fetchData2(function(err, results) {
						if (err) {
							logger.log("error", "Error occurred while executing query = " + query1);
							throw err;
						} else {
							var query2 = "update itemsforsale set quantity=quantity-" + req.param("quantityBought") + " where id=" + req.param("itemId");
							console.log("Query is : " + query2);
							logger.log("info", "Executing query = " + query2);
							
							mysql.fetchData2(function(err, results) {
								if (err) {
									logger.log("error", "Error occurred while executing query = " + query2);
									throw err;
								} else {
									json_response = {
										"statuscode" : 200
									};
									res.send(json_response);
								}
							}, query2);
						}
					}, query1);
				}
			}
		}, query);
	} else {
		res.redirect('/');
	}
	
};

exports.removeFromCart = function(req, res) {

	var json_response;
	if (req.session.user) {
	logger.log("info", "Remove from cart button clicked by user. Remoing item with id = " + req.param("itemId") 
			+ " from shopping cart of user with id = " + req.session.user.user_id);
	var query = "delete from shoppingcart where itemId="+ req.param("itemId");
	console.log("Query is : " + query);
	logger.log("info", "Executing query = " + query);

	mysql.fetchData2(function(err, results) {
		if (err) {
			logger.log("error", "Error occurred while executing query = " + query);
			throw err;
		} else {
			logger.log("info", "Updating quantity in itemsforsale table for item with id = " + req.param("itemId") + 
					" to reflect item removed from cart for user with id = " + req.session.user.user_id);
			var query1 = "update itemsforsale set quantity=quantity+" + req.param("quantityBought") + " where id=" + req.param("itemId");
			console.log("Query is : " + query1);
			logger.log("info", "Executing query = " + query1);
			mysql.fetchData2(function(err, results) {
				if (err) {
					logger.log("error", "Error occurred while executing query = " + query1);
					throw err;
				} else {
					json_response = {
						"statuscode" : 200
					};
					res.send(json_response);
				}
			}, query1);
		}
	}, query);
}else {
	res.redirect('/');
}
};