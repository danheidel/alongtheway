(function(NS){
  'use strict';
  /*global google*/

  NS.getGeoLocation = function() {

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(handleGeoLocation, handleNoGeolocation);
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
};

function handleGeoLocation(pos){
  //console.log(pos);
  window.controller.mode.hasLocation = true;
  window.controller.userLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
}

function handleNoGeolocation(errorFlag) {
  var content;
  if (errorFlag) {
    content = 'Error: The Geolocation service failed.';
  } else {
    content = 'Error: Your browser doesn\'t support geolocation.';
  }
}

})(window.geolocation = window.geolocation || {});
