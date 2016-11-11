var ejs = require('ejs');
var mysql = require('./mysql');
var logger = require('./logger');
var bidlogger = require('./bidlogger');

exports.displaySellerPage = function(req, res) {
	if(req.session.user) {
	logger.log("info", "Displaying seller home page for user with id = " + req.session.user.user_id);
	ejs.renderFile('./views/ebaysellerhome.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying seller home page");
			res.end('An error occurred');
			console.log(err);
		}
	});
	} else {
		res.redirect('/');
	}
};

exports.displayListing = function(req, res) {
	logger.log("info", "Displaying listing page for user with id = " + req.session.user.user_id);
	ejs.renderFile('./views/ebaylisting.ejs', function(err, result) {
		if (!err) {
			res.end(result);
		} else {
			logger.log("error", "Error occurred while displaying listing page");
			res.end('An error occurred');
			console.log(err);
		}
	});
};

exports.getListingDetails = function(req, res) {
	var json_response;

	if (req.session.user) {
	logger.log("info", "Fetching listing details for item with id = " + req.param("itemId") + " for user with id = " + req.session.user.user_id);
	var query = "select * from itemsforsale where id=" + req.param("itemId");
	console.log("Query is : " + query);
	logger.log("info", "Executing query = " + query);

	mysql.fetchData2(function(err, results) {
		if (err) {
			logger.log("error", "Error occurred while executing query = " + query);
			throw err;
		} else {
			logger.log("info", "Listing details for item with id = " + req.param("itemId") + " for user with id = " + req.session.user.user_id
					+ " fetched successfully");
			json_response = {
					"statuscode" : 200,
					"sessionuser" : req.session.user,
					"listingitem" : results[0]
				};
				res.send(json_response);
		}
	}, query);
	
	} else {
		res.redirect('/');
	}

};

exports.createList = function(req, res) {
	var json_response;
	var bidenddate;
	if (req.session.user) {
	logger.log("info", "Create listing button clicked by user with id = " + req.session.user.user_id);
	var time = new Date();
	var dateTime = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
			+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
			+ ":" + time.getSeconds();
	console.log(dateTime);
	
	if(req.param("isbidproduct") === 1) {
		var date = new Date(time.getTime() + 4*24*60*60*1000);
		bidenddate = date.getFullYear() + "-" + (date.getMonth()+1) + "-"
		+ date.getDate();
		console.log("bidenddate : " + bidenddate);
		logger.log("info", "Listing to be created is a bid product for user with id = " + req.session.user.user_id + 
				" with bid end date = " + bidenddate);
		bidlogger.log("info", "Listing to be created is a bid product for user with id = " + req.session.user.user_id + 
				" with bid end date = " + bidenddate);
	} else {
		bidenddate = '0000-00-00';
	}
	var query = "insert into itemsforsale values(NULL,"
			+ req.session.user.user_id + ",'" + req.param("itemname") + "','" + req.param("itemdescription")
			+ "','" + req.session.user.firstname + "','"
			+ req.param("itemaddress") + "'," + req.param("itemprice") + ","
			+ req.param("itemquantity") + ",'" + dateTime + "'," + req.param("isbidproduct") + ",'" + bidenddate + "'," + 0 + ")";
	console.log("Query is : " + query);
	logger.log("info", "Executing query = " + query);

	mysql.fetchData2(function(err, results) {
		if (err) {
			logger.log("error", "Error occurred while executing query = " + query);
			throw err;
		} else {
			logger.log("info", "Listing created for for user with id = " + req.session.user.user_id);
			if(req.param("isbidproduct") == 1) {
				bidlogger.log("info", "Listing for bidding created for for user with id = " + req.session.user.user_id);
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

exports.bidproduct = function(req, res) {

	var json_response;

	if (req.session.user) {
		logger.log("info", "Bid product button clicked for item id = " + req.param("itemId") + " by user with id = " + req.session.user.user_id);
		bidlogger.log("info", "Bid product button clicked for item id = " + req.param("itemId") + " by user with id = " + req.session.user.user_id);
		var time = new Date();
		var bidDate = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
		+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
		+ ":" + time.getSeconds();
		console.log(bidDate);

	var query = "insert into biduser values(NULL," + req.session.user.user_id + "," +
	req.param("itemId") + "," + req.param("bidamount") + ",'" + bidDate + "')";
	console.log("Query is : " + query);
	logger.log("info", "Executing query = " + query);
	bidlogger.log("info", "Executing query = " + query);

	mysql.fetchData2(function(err, results) {
		if (err) {
			logger.log("error", "Error occurred while executing query = " + query);
			bidlogger.log("error", "Error occurred while executing query = " + query);
			throw err;
		} else {
			logger.log("info", "Bid amount of " + req.param("bidamount") + " for item id = " + req.param("itemId")
					+ " entered in DB for user with id = " + req.session.user.user_id);
			bidlogger.log("info", "Bid amount of " + req.param("bidamount") + " for item id = " + req.param("itemId")
					+ " entered in DB for user with id = " + req.session.user.user_id);
			var query1 = "update itemsforsale set itemprice = " + req.param("bidamount") + " where id = " + req.param("itemId");
		console.log("Query is : " + query1);
		logger.log("info", "Executing query = " + query1);
		bidlogger.log("info", "Executing query = " + query1);
		mysql.fetchData2(function(err, results) {
			if (err) {
				logger.log("error", "Error occurred while executing query = " + query1);
				bidlogger.log("error", "Error occurred while executing query = " + query1);
				throw err;
			} else {
				logger.log("info", "Bid amount entered in DB successully for user with id = " + req.session.user.user_id);
				bidlogger.log("info", "Bid amount entered in DB successully for user with id = " + req.session.user.user_id);
				json_response = {
					"statuscode" : 200
				};
				res.send(json_response);
			}
		}, query1);
		}
	}, query);
	
	} else {
		res.redirect('/');
	}

};