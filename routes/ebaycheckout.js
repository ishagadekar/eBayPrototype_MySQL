var ejs = require('ejs');
var mysql = require('./mysql');
var logger = require('./logger');

exports.displayCheckout = function(req, res) {
	logger.log("info", "Displaying checkout page for user with id = " + req.session.user.user_id);
	ejs.renderFile('./views/ebaycheckout.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.removecartitems = function(req, res) {
	logger.log("info", "Removing cart items for checkout after cart items checkout");
	var json_response;

	if (req.session.user) {
		logger.log("info", "Removing cart items for user with id = " + req.session.user.user_id);
		var query = "delete from shoppingcart where userId=" + req.session.user.user_id;
		console.log("Query is : " + query);
		logger.log("info", "Executing query = " + query);

		mysql.fetchData2(function(err, results) {
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query);
				throw err;
			} else {
					console.log("Cart items deleted");
					logger.log("info", "Cart items deleted for user with id = " + req.session.user.user_id);
					var cartItems = req.param("cartItems");
					var time = new Date();
					var date = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
							+ time.getDate();
					console.log("Purchase/Sell date : " + date);
					
					var stampmonths = new Array( "01","02","03","04","05","06","07","08","09","10","11","12");
					var thedate = new Date();
					var orderId = stampmonths[thedate.getMonth()] + thedate.getDate() + thedate.getFullYear() + thedate.getSeconds();
					console.log("Order Id is : " + orderId);
					logger.log("info", "Order id for user with id = " + req.session.user.user_id + " is = " + orderId);
					
					for(var i = 0; i < cartItems.length; i++) {
						logger.log("info", "Inserting cart items into user activity history for user with id = " + req.session.user.user_id);
						var query1 = "insert into useractivityhistory values(" + orderId + "," + req.session.user.user_id +"," 
						+ cartItems[i].id + "," + cartItems[i].quantity + ",'" + date + "')";
						console.log("Query is : " + query1);
						logger.log("info", "Executing query = " + query1);
						
						mysql.fetchData2(function(err, results) {
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query1);
								throw err;
							} else {
								logger.log("info", "User activity history updated for user with id = " + req.session.user.user_id);
								console.log("Query executed successfully");
								res.send(json_response);
							}
						}, query1);
					
						var query2 = "insert into usersellhistory values(" + orderId + "," + cartItems[i].sellerId +"," 
						+ cartItems[i].id + "," + cartItems[i].quantity + ",'" + date + "')";
						logger.log("info", "Inserting bought items into seller's sell history for seller with id = " + cartItems[i].sellerId);
						console.log("Query is : " + query2);
						logger.log("info", "Executing query = " + query2);
						
						mysql.fetchData2(function(err, results) {
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query2);
								throw err;
							} else {
								logger.log("info", "Seller's sell history updated for seller with id =  = " + cartItems[i].sellerId);
								console.log("Query executed successfully");
								res.send(json_response);
							}
						}, query2);
					}
					json_response = {
						"statuscode" : 200
					};
					res.send(json_response);
			}
		}, query);
	} else {
		res.redirect('/');
	}
};

exports.removeboughtitems = function(req, res) {
	logger.log("info", "Removing bought items for checkout after buy now click");
	var json_response;

	if (req.session.user) {
		
		var query = "update itemsforsale set quantity=quantity-" + req.param("quantity") + " where id=" + req.param("itemId");
		console.log("Query is : " + query);
		logger.log("info", "Executing query = " + query);

		mysql.fetchData2(function(err, results) {
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query);
				throw err;
			} else {
					console.log("Items for sale updated");
					logger.log("info", "Items for sale updated");
					var time = new Date();
					var date = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
					+ time.getDate();
					console.log(date);
					
					var stampmonths = new Array( "01","02","03","04","05","06","07","08","09","10","11","12");
					var thedate = new Date();
					var orderId = stampmonths[thedate.getMonth()] + thedate.getDate() + thedate.getFullYear() + thedate.getSeconds();
					console.log("Order Id is : " + orderId);
					logger.log("info", "Order id for user with id = " + req.session.user.user_id + " is = " + orderId);
					
						var query1 = "insert into useractivityhistory values(" + orderId + "," + req.session.user.user_id +"," 
						+ req.param("itemId") + "," + req.param("quantity") + ",'" + date + "')";
						console.log("Query is : " + query1);
						logger.log("info", "Executing query = " + query1);
						
						mysql.fetchData2(function(err, results) {
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query1);
								throw err;
							} else {
								logger.log("info", "User activity history updated for user with id = " + req.session.user.user_id);
								console.log("Query for " + req.param("itemId") + " executed successfully");
								res.send(json_response);
							}
						}, query1);
					
						var query2 = "insert into usersellhistory values(" + orderId + "," + req.param("sellerId") +"," 
						+ req.param("itemId") + "," +  req.param("quantity") + ",'" + date + "')";
						console.log("Query is : " + query1);
						logger.log("info", "Executing query = " + query2);
						
						mysql.fetchData2(function(err, results) {
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query2);
								throw err;
							} else {
								logger.log("info", "Seller's sell history updated for seller with id =  = " + req.param("sellerId"));
								console.log("Query executed successfully");
								res.send(json_response);
							}
						}, query2);
						
					json_response = {
						"statuscode" : 200
					};
					res.send(json_response);
			}
		}, query);
	} else {
		res.redirect('/');
	}
};