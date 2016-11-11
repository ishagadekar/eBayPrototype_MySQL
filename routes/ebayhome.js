var ejs = require('ejs');
var mysql = require('./mysql');
var Crypto = require("crypto");
var logger = require('./logger');
var bidlogger = require('./bidlogger');

exports.displaySignIn = function(req, res) {
	logger.log("info", "Sign in or register link clicked");
	/*function censor(censor) {
		  var i = 0;

		  return function(key, value) {
		    if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
		      return '[Circular]'; 

		    if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
		      return '[Unknown]';

		    ++i; // so we know we aren't using the original object anymore

		    return value;  
		  };
		}

		console.log("Censoring: req");
		console.log(req.url);
		console.log("Result: ", JSON.stringify(req, censor(req)));*/
//	console.log(JSON.stringify(req));
//	logger.log("info", "")
	ejs.renderFile('./views/ebayloginregister.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying sign in or register page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.displayRegister = function(req, res) {
	ejs.renderFile('./views/ebayregister.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.displayHome = function(req, res) {
	logger.log("info", "Displaying home page for user with id = " + req.session.user.user_id);
	ejs.renderFile('./views/ebayhome.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying home page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.displaymyebay = function(req, res) {
	logger.log("info", "Displaying MyeBay page for user with id = " + req.session.user.user_id);
	ejs.renderFile('./views/ebaymyebay.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying MyeBay page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.checkSignIn = function(req, res) {

	logger.log("info", "Sign in button clicked by user to check for email id = " + req.param("username"));
	var json_response;
	
	var query = "select * from users where email='" + req.param("username")
			+ "'";// and password='" + req.param("password") + "'";
	console.log("Query is : " + query);
	logger.log("info", "Executing query = " + query);
	
	mysql.fetchData2(function(err, results) {
		if (err) {
			logger.log("error", "Error occurred while checking sign in credentials for user with email id = " + req.param("username"));
			throw err;
		} else {
			if (results.length > 0) {
				logger.log("info", "Sign in credentials fetched successfully and email id is valid for user with email id = " + req.param("username"));
				
				var salt = "Bl@ckS@1t";
				var encryptedPassword = Crypto.createHash('sha1').update(req.param("password") + salt).digest('hex');
				
				if (encryptedPassword === results[0].password) {
					console.log("Valid login.");
					
					req.session.user = results[0];
					logger.log("info", "Sign in credentials fetched successfully and are valid for user with id = " + req.session.user.user_id);
					logger.log("info", "User = " + JSON.stringify(req.session.user) + " with id = " + req.session.user.user_id + " has been put into the session");
					json_response = {
						"statuscode" : 200,
						"user" : req.session.user
					};
					
					var time = new Date();
					var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
							+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
							+ ":" + time.getSeconds();
					console.log(logintime);
					logger.log("info", "Login time to be updated for user with id = " + req.session.user.user_id + " is = " + logintime);
					
					var query1 = "update users set logintime='" + logintime + "' where email='" + req.param("username")
									+ "'";
				console.log("Query is : " + query1);
				logger.log("info", "Executing query = " + query1);
				
				mysql.fetchData2(function(err, results) {
					if (err) {
						logger.log("error", "Error occurred while updating login time for user with email id = " + req.param("username"));
						throw err;
					} else {
						logger.log("info", "Login time updated successfully for user with id = " + req.session.user.user_id);
						console.log("Login time updated successfully");
						res.send(json_response);
					}
				}, query1);
					
				
				} else {
					logger.log("info", "Sign in credentials fetched successfully but password is invalid for user with email id = " + req.param("username"));
					console.log("Invalid username and/or password.");
					json_response = {
						"statuscode" : 401
					};
					res.send(json_response);
				}
			} else {
				logger.log("info", "Sign in credentials fetched successfully but either email id or password is invalid for user with email id = " + req.param("username"));
				console.log("Invalid username and/or password.");
				json_response = {
					"statuscode" : 401
				};
				res.send(json_response);
			}
		}
	}, query);

};

exports.checkAndRegisterUser = function(req, res) {

	logger.log("info", "Register button clicked by user to register for email id = " + req.param("username"));
	
	var json_response;

	var query = "select * from users where email='" + req.param("username")
			+ "'";
	console.log("Query is : " + query);
	logger.log("info", "Executing query = " + query);

	mysql.fetchData2(function(err, results) {
		if (err) {
			logger.log("error", "Error occurred while processing query to check if user with email id = " + 
					req.param("username") + " already exists in DB for checkAndRegisterUser functionality");
			throw err;
		} else {
			if (results.length > 0) {
				console.log("User with same email id already exists.");
				logger.log("info", "User with same email id = " + req.param("username") + " already exists.");
				
				json_response = {
					"statuscode" : 401
				};
				res.send(json_response);
			} else {
				console.log("New user registration.");
				logger.log("info", "Registering user with email id = " + req.param("username"));
				var salt = "Bl@ckS@1t";
				var encryptedPassword = Crypto.createHash('sha1').update(req.param("password") + salt).digest('hex');
				console.log(encryptedPassword);
				var dateTime = 0 + "-" + 0 + "-" + 0 + " " + 0 + ":" + 0 + ":" + 0;
				console.log(dateTime);

				console.log("Dob : " + req.param("dob"));
				var time = new Date(req.param("dob"));
				var dob = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
						+ time.getDate();
				
				var query1 = "insert into users values(NULL,'"
						+ req.param("firstName") + "','"
						+ req.param("lastName") + "','" + req.param("username")
						+ "','" + encryptedPassword + "','" + req.param("handle") + "','" + dateTime + "','" + dob + "','" +
						req.param("phone") + "','" + req.param("address") + "')";
				console.log("Query is : " + query1);
				logger.log("info", "Executing query = " + query1);
				
				mysql.fetchData2(function(err, results) {
					if (err) {
						logger.log("error", "Error occurred while executing query to insert values in users table" +
								"for user with email id = " + req.param("username"));
						throw err;
					} else {
						logger.log("info", "User with email id = " + req.param("username") + " has been registered successfully");
						json_response = {
							"statuscode" : 200
						};
						res.send(json_response);
					}
				}, query1);
			}
		}
	}, query);
};

exports.getsummary = function(req, res) {

	var json_response;

	var query = "select * from users where email='" + req.param("username")
			+ "'";// and password='" + req.param("password") + "'";
	console.log("Query is : " + query);
	logger.log("info", "Executing query = " + query);

	mysql.fetchData2(function(err, results) {
		if (err) {
			throw err;
		} else {
			if (results.length > 0) {
				var salt = "Bl@ckS@1t";
				var encryptedPassword = Crypto.createHash('sha1').update(req.param("password") + salt).digest('hex');
//				var passwordhash = crypto.createDecipher("aes192",
//						results[0].password);
				if (encryptedPassword === results[0].password) {
					console.log("Valid login.");
					
					req.session.user = results[0];
					json_response = {
						"statuscode" : 200,
						"user" : req.session.user
					};
					
					var time = new Date();
					var logintime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
							+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
							+ ":" + time.getSeconds();
					console.log(logintime);
					
					var query1 = "update users set logintime='" + logintime + "' where email='" + req.param("username")
									+ "'";
				console.log("Query is : " + query1);
				mysql.fetchData2(function(err, results) {
					if (err) {
						throw err;
					} else {
						console.log("Login time updated successfully");
						res.send(json_response);
					}
				}, query1);
					
				
				} else {
					console.log("Invalid username and/or password.");
					json_response = {
						"statuscode" : 401
					};
					res.send(json_response);
				}
			} else {
				console.log("Invalid username and/or password.");
				json_response = {
					"statuscode" : 401
				};
				res.send(json_response);
			}
		}
	}, query);

};

exports.getUserData = function(req, res) {
	logger.log("info", "Fetching home page data after home page hit");
	var json_response;

	if (req.session.user) {
		
		var query = "select * from itemsforsale where sellername != '"
				+ req.session.user.firstname + "' and quantity > 0 ORDER BY timestamp DESC;";
		console.log("Query is : " + query);
		logger.log("info", "Executing query = " + query);

		mysql.fetchData2(function(err, results) {
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query + " for home page data");
				throw err;
			} else {
				if (results.length > 0) {
					var time = new Date();
					var bidDate = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
					+ time.getDate();
					console.log(bidDate);
					
					var productsToBeShown = [];
					var closeBids = [];
					
					for(var i = 0; i < results.length; i++) {
						var time1 = new Date(results[i].bidenddate);
						var bidDate1 = time1.getFullYear() + "-" + (time1.getMonth()+1) + "-"
						+ time1.getDate();
						console.log(bidDate);
						if(bidDate1 > bidDate) {
							productsToBeShown.push(results[i]);
						} else if (bidDate1 === bidDate && results[i].sold != 1) {
							bidlogger.log("info", "Bid end date " + bidDate1 + " for item with id = " + results[i].id + " has come");
							closeBids.push(results[i].id);
							var query2 = "select * from biduser where itemId = "
								+ results[i].id;
						console.log("Query is : " + query2);
						logger.log("info", "Executing query = " + query2);
						bidlogger.log("info", "Executing query = " + query2);
						
						mysql.fetchData2(function(err, results2) {
							if (err) {
								logger.log("error", "Error occurred while executing query = " + query2);
								bidlogger.log("error", "Error occurred while executing query = " + query2);
								throw err;
							} else {
								var length = results2.length;
								if(length > 0) {
									logger.log("info", "Fetching data from bid users to get highest bidder");
									bidlogger.log("info", "Fetching data from bid users to get highest bidder");
									var stampmonths = new Array( "01","02","03","04","05","06","07","08","09","10","11","12");
									var thedate = new Date();
									var orderId = stampmonths[thedate.getMonth()] + thedate.getDate() + thedate.getFullYear() + thedate.getSeconds();
									console.log("Order Id is : " + orderId);
									
									var time2 = new Date(results2[length-1].biddate);
									var bidDate2 = time2.getFullYear() + "-" + (time2.getMonth()+1) + "-"
									+ time2.getDate() + " " + time2.getHours() + ":" + time2.getMinutes()
									+ ":" + time2.getSeconds();
									
									var query3 = "insert into bidwinners values(NULL," + results2[length-1].userId + ","
									+ results2[length-1].itemId + "," + results2[length-1].bidamount + "," + orderId + ",'" 
									+ bidDate2 + "')";
									console.log("Query is : " + query3);
									logger.log("info", "Executing query = " + query3);
									bidlogger.log("info", "Executing query = " + query3);
									bidlogger.log("info", "Highest bidder for item id = " + results2[length-1].itemId + " is user with id = " + results2[length-1].userId);
									
									mysql.fetchData2(function(err, results3) {
										if (err) {
											logger.log("error", "Error occurred while executing query = " + query3);
											bidlogger.log("error", "Error occurred while executing query = " + query3);
											throw err;
										} else {
											var query4 = "update itemsforsale set sold = 1 where  id = " + results2[length-1].itemId;
											console.log("Query is : " + query4);
											logger.log("info", "Executing query = " + query4);
											bidlogger.log("info", "Executing query = " + query4);
											
											mysql.fetchData2(function(err, results4) {
												if (err) {
													logger.log("error", "Error occurred while executing query = " + query4);
													bidlogger.log("error", "Error occurred while executing query = " + query4);
													throw err;
												} else {
													console.log("Bid queries done successfully");
													logger.log("Bid queries done successfully");
													bidlogger.log("Bid queries done successfully");
												}
											}, query4);
										}
									}, query3);
								} 
							}
						}, query2);
					}
				}
					
					console.log("Listings fetched");
					json_response = {
						"statuscode" : 200,
						"sessionuser" : req.session.user,
						"listings" : productsToBeShown
					};
//					res.send(json_response);
				} else {
					console.log("No listings in database");
					logger.log("info", "No items to show on home page listings");
					json_response = {
						"statuscode" : 401,
						"sessionuser" : req.session.user
					};
//					res.send(json_response);
				}
				res.send(json_response);
			}
		}, query);
	} else {
		res.redirect('/');
	}
};

exports.getMyEbayDetails = function(req, res) {
	logger.log("info", "User clicked on MyeBay link");
	var json_response = {items:[]};
	var purchasehistory = [];
	var puchaseditems = [];
	var sellhistory = [];
	var sellitems = [];
	/*var bidhistory = [];
	var biditems = [];
	var ownbids = [];*/
	
	if (req.session.user) {
		
		var query = "SELECT * FROM useractivityhistory where userId=" +  req.session.user.user_id;
		console.log("Query is : " + query);
		logger.log("info", "Executing query = " + query);

		mysql.fetchData2(function(err, results) {
			logger.log("error", "Error occurred while executing query = " + query);
			if (err) {
				throw err;
			} else {
				if (results.length > 0) {
					console.log("Purchase history fetched for user with id " + req.session.user.user_id);
					logger.log("info", "Purchase history fetched for user with id = " + req.session.user.user_id);
					
					var query1 = "select * from itemsforsale inner join useractivityhistory on itemsforsale.id = useractivityhistory.itemId";
					console.log("Query is : " + query1);
					logger.log("info", "Executing query = " + query1);
					
					mysql.fetchData2(function(err, results1) {
						if (err) {
							logger.log("error", "Error occurred while executing query = " + query);
							throw err;
						} else {
							console.log("Items purchased fetched for user with id " + req.session.user.user_id);
							logger.log("info", "Items purchased fetched for user with id = " + req.session.user.user_id);
							 purchasehistory = results;
							 puchaseditems = results1;
							 json_response.items.push(
										{"user" : req.session.user},
										{"purchasehistory" : purchasehistory},
											{"puchaseditems" : puchaseditems}
			 );
						}
					}, query1);
				} else {
					console.log("No purchase history found for user with id " + req.session.user.user_id);
					logger.log("info", "No purchase history found for user with id = " + req.session.user.user_id);
					 purchasehistory = [];
					 puchaseditems = [];
					 json_response.items.push(
												{"user" : req.session.user},
												{"purchasehistory" : purchasehistory},
													{"puchaseditems" : puchaseditems}
					 );
				}
				
				var query2 = "SELECT * FROM usersellhistory where sellerId=" +  req.session.user.user_id;
				console.log("Query is : " + query2);
				logger.log("info", "Executing query = " + query2);

				mysql.fetchData2(function(err, results2) {
					if (err) {
						logger.log("error", "Error occurred while executing query = " + query);
						throw err;
					} else {
						if (results2.length > 0) {
							console.log("Sell history fetched for user with id " + req.session.user.user_id);
							logger.log("info", "Sell history fetched for user with id = " + req.session.user.user_id);
							
							var query3 = "select * from itemsforsale inner join usersellhistory on itemsforsale.id = usersellhistory.itemId";
							console.log("Query is : " + query3);
							logger.log("info", "Executing query = " + query3);
							
							mysql.fetchData2(function(err, results3) {
								logger.log("error", "Error occurred while executing query = " + query);
								if (err) {
									throw err;
								} else {
									 console.log("Items sold fetched for use with id " + req.session.user.user_id);
									 logger.log("info", "Items sold fetched for use with id = " + req.session.user.user_id);
									 
									 sellhistory = results2;
									 sellitems = results3;
									 json_response.items.push(
												 {"sellhistory" : sellhistory},
												 {"sellitems" : sellitems}
											 );
									 res.send(json_response);
								}
							}, query3);
						} else {
							console.log("No sell history found for use with id " + req.session.user.user_id);
							logger.log("info", "No sell history found for use with id = " + req.session.user.user_id);
							
							sellhistory = [];
							sellitems = [];
							 json_response.items.push(
									 {"sellhistory" : sellhistory},
									 {"sellitems" : sellitems}
								 );
							 res.send(json_response);
						}
					}
				}, query2);
				
				/*var query4 = "SELECT * FROM bidwinners where userId=" +  req.session.user.user_id;
				console.log("Query is : " + query4);

				mysql.fetchData2(function(err, results4) {
					if (err) {
						throw err;
					} else {
						if(results4.length > 0) {
							console.log("Bid history fetched for user with id " + req.session.user.user_id);
							var query5 = "select * from itemsforsale inner join bidwinners on itemsforsale.id = bidwinners.itemId";
							console.log("Query is : " + query5);
							
							mysql.fetchData2(function(err, results5) {
								if (err) {
									throw err;
								} else {
									 console.log("Bid items  fetched for use with id " + req.session.user.user_id)
									 bidhistory = results4;
									 biditems = results5;
									 json_response.items.push(
												 {"bidhistory" : bidhistory},
												 {"biditems" : biditems}
											 );
									 res.send(json_response);
								}
							}, query5);
						} else {
							console.log("No bid history found for use with id " + req.session.user.user_id);
							bidhistory = [];
							biditems = [];
							 json_response.items.push(
									 {"bidhistory" : bidhistory},
									 {"sellitems" : biditems}
								 );
							 res.send(json_response);
						}
 					}
				}, query4);*/
				
			/*	var query6 = "SELECT * FROM itemsforsale where sellerId=" +  req.session.user.user_id + 
				" and isbidproduct = 1";
				console.log("Query is : " + query6);

				mysql.fetchData2(function(err, results6) {
					if (err) {
						throw err;
					} else {
						if(results6.length > 0) {
							console.log("User's own bid history fetched for user with id " + req.session.user.user_id);
							ownbids = results6;
							json_response.items.push(
									 {"ownbids" : ownbids}
								 );
							 res.send(json_response);
						} else {
							console.log("No bid history found for use with id " + req.session.user.user_id);
							ownbids = [];
							 json_response.items.push(
									 {"ownbids" : ownbids}
								 );
							 res.send(json_response);
						}
 					}
				}, query6);*/
				
			}
		}, query);
			
	} else {
		res.redirect('/');
	}
};

exports.signout = function(req, res) {
	logger.log("info", "User with id = " + req.session.user.user_id + " has been signed out successfully");
	req.session.destroy();
	console.log("Session destroyed");
	res.redirect('/');
};
