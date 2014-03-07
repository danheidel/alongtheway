module.exports.app = function(){
  'use strict';

	var map = L.map('map').setView([51.505, -0.09], 13);
	L.tileLayer('http://{s}.tile.cloudmade.com/3d3d4d0296a14a349b701e70ca1b2587/997/256/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    maxZoom: 18
}).addTo(map);


};