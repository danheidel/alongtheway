(function(NS){

  var initialLocation;
  var home = new google.maps.LatLng(47.656801, -122.361748);
  var browserSupportFlag =  new Boolean();

  function initialize() {
    var myOptions = {
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

    // Get Geolocation
    if(navigator.geolocation) {
      browserSupportFlag = true;
      navigator.geolocation.getCurrentPosition(function(position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        map.setCenter(initialLocation);
      }, function() {
        handleNoGeolocation(browserSupportFlag);
      });
    }
    // Browser doesn't support Geolocation
    else {
      browserSupportFlag = false;
      handleNoGeolocation(browserSupportFlag);
    }

    function handleNoGeolocation(errorFlag) {
      if (errorFlag == true) {
        alert("Geolocation service failed.");
        initialLocation = home;
      } else {
        alert("Your browser doesn't support geolocation.");
        initialLocation = home;
      }
      map.setCenter(initialLocation);
    }
  }

})(window.geolocation = window.geolocation || {});
