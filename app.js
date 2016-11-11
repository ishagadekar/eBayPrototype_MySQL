/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), http = require('http'), path = require('path'), session = require('client-sessions');

var app = express();
var ebayHome = require('./routes/ebayhome');
var sellItems = require('./routes/ebaysell');
var cart = require('./routes/ebayshoppingcart');
var checkout = require('./routes/ebaycheckout');
var userProfile = require('./routes/ebayuserprofile');

app.use(session({

	cookieName : 'session',
	secret : 'cmpe273_test_string',
	duration : 30 * 60 * 1000, // setting the time for active session
	activeDuration : 5 * 60 * 1000,
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
//app.get('/signIn', ebayHome.displaySignIn);
app.get('/signInSignUpForm', ebayHome.displaySignIn);
app.get('/register', ebayHome.displayRegister);

app.post('/checkSignIn', ebayHome.checkSignIn);
app.post('/registerUser', ebayHome.checkAndRegisterUser);

app.get('/home', ebayHome.displayHome);
app.post('/login', ebayHome.getUserData);

app.get('/userprofile', userProfile.displayUserProfile);
app.post('/displayuserdetails', userProfile.getUserDetails);

app.get('/sellItems', sellItems.displaySellerPage);
app.post('/list', sellItems.createList);
app.get('/showlisting', sellItems.displayListing);
app.post('/bidproduct', sellItems.bidproduct);
app.post('/listingdetails', sellItems.getListingDetails);

app.get('/shoppingcart', cart.displayShoppingCart);
app.post('/displayshoppingcart', cart.getCartDetails);
app.post('/removefromshoppingcart', cart.removeFromCart);
app.post('/addtocart', cart.saveCart);

app.get('/myebay', ebayHome.displaymyebay);
app.post('/myebayhome', ebayHome.getMyEbayDetails);
app.post('/activity', ebayHome.getsummary);

app.get('/checkout', checkout.displayCheckout);
app.post('/removecartitems', checkout.removecartitems);
app.post('/removeboughtitems', checkout.removeboughtitems);

app.get('/signout', ebayHome.signout);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
