User = require('./app/User.js');
// bcrypt = require('bcrypt');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var url = require('url');

app.use(express.bodyParser());
app.set('view options', { layout: false });
app.use(express.static(__dirname + '/app'));
app.use(express.logger('dev'));
app.use(express.query());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: "mysecret"}));



var yelp = require("yelp").createClient({
  consumer_key: "ObT9iKZSDNTQ0jP9z0sXJQ", 
  consumer_secret: "fXCjZf4bc6gVhdGJn_n4AdyZvAY",
  token: "-ejmdEd8UkjzWCk4PCib1Fi85nX-Sz70",
  token_secret: "V0vD05HWENihFBBseOE2Oq8LhR4"
});

var util = require('util');

markers = [
    { 'location': '300 W Main St Lock Haven, PA' },
    { 'location': '444 W Main St Lock Haven, PA',
        'color': 'red',
        'label': 'A',
        'shadow': 'false',
        'icon' : 'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe%7C996600'
    }
]

styles = [
    { 'feature': 'road', 'element': 'all', 'rules': 
        { 'hue': '0x00ff00' }
    }
]

paths = [
    { 'color': '0x0000ff', 'weight': '5', 'points': 
        [ '41.139817,-77.454439', '41.138621,-77.451596' ]
    }
]

app.get('/getyelp', function(req,res){
	yelp.search({term: "tacos", location: "Seattle"}, function(error, data) {
	  res.send(data);
	});
});

app.get('/', function (req, res) {
	res.redirect('index.html');
});

console.log("server started on 3000");
app.listen(3000);