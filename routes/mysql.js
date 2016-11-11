var ejs = require('ejs');
var mysql = require('mysql');

//For Connection Pool
var queue = require('queue');
var connectionPool = new queue();

// Put your mysql configuration settings - user, password, database and port
function getConnection() {
	var connection = mysql.createConnection({
		host : 'localhost',
		user : 'root',
		password : 'root',
		database : 'ebaydb',
		port : 3306,
		acquireTimeout: 1000000
	});
	return connection;
}

function fetchData(callback, sqlQuery) {

	console.log("\nSQL Query:: " + sqlQuery);

	var connection = getConnection();

	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			console.log("ERROR: " + err.message);
		} else { // return err or result
			console.log("DB Results:" + rows);
			callback(err, rows);
		}
	});
	console.log("\nConnection closed..");
	connection.end();
}

//ConnectionPool

function fetchData2(callback,sqlQuery){
	
	console.log("\nSQL Query::" + sqlQuery);
	
	var connection=getConnectionPool();
	
	
	connection.query(sqlQuery, function(err, rows, fields) {
		if(err){
			console.log("ERROR: " + err.message);
		}
		else 
		{	// return err or result
			console.log("DB Results:"+rows);
			callback(err, rows);
		}
	});
	console.log("\nConnection returned...");
	returnConnectionToPool(connection);
}	

function createConnectionPool(num) {
	
	if(connectionPool !== null) {
		connectionPool.start();
		for(var i =0; i< num; i++) {
			connectionPool.push(getConnection());
		}
	}
}

function getConnectionPool() {
	
	if(getPoolSize() <= 0) {
		updateConnectionPool(100);
	}
	connectionPool.reverse();
	connection = connectionPool.pop();
	connectionPool.reverse();
	return connection;
}

function getPoolSize() {
	
	if(connectionPool != null){
		return connectionPool.length;
	}
}

function updateConnectionPool(num) {
	if(connectionPool != null) {
		for(var i =0; i< num; i++) {
			connectionPool.push(getConnection());
		}
	}	
}

function returnConnectionToPool(connection){
	if(connectionPool != null) {
		connectionPool.push(connection)
	}
}

function terminateConnectionPool() {
	if(connectionPool != null) {
		connectionPool.stop();
	}	
}

exports.terminateConnectionPool = terminateConnectionPool;
exports.createConnectionPool = createConnectionPool;
exports.fetchData = fetchData;
exports.fetchData2 = fetchData2;