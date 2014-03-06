(function(NS){


  NS.initialize = function initialize() {
  // var mapOptions = {
  //   zoom: 6
  // };
  // map = new google.maps.Map(document.getElementById('map-canvas'),
  //     mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var infowindow = new google.maps.InfoWindow({
        map: window.googleMaps.map,
        position: pos,
        content: 'Location found using HTML5.'
      });

      window.googleMaps.map.setCenter(pos);
    }, function() {
      NS.handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    NS.handleNoGeolocation(false);
  }
}

NS.handleNoGeolocation = function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: window.googleMaps.map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  window.googleMaps.map.setCenter(options.position);
}


})(window.geolocation = window.geolocation || {});
