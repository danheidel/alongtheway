(function(NS){

  NS.initialize = function(lat, lng, zoom, type){
    var mapOptions = {
      center: new google.maps.LatLng(lat || 47.624, lng || 237.664),
      mapTypeId: type || google.maps.MapTypeId.ROADMAP,
      zoom: zoom || 12
    };
    NS.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    NS.directionsDisplay = new google.maps.DirectionsRenderer();
    NS.directionsDisplay.setPanel(document.getElementById('directions-panel'));
    NS.directionsDisplay.setMap(map);
    NS.directionsService = new google.maps.DirectionsService();
    NS.directionRenderer = new google.maps.DirectionsRenderer({ map: map });
    NS.placesService = new google.maps.places.PlacesService(map);
    NS.routeBoxer = new RouteBoxer();
    NS.infoWindow = new google.maps.InfoWindow();
  };

})(window.googleMaps = window.googleMaps || {});