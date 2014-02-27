(function(NS){

  NS.initialize = function(lat, lng, zoom, type){
    var mapOptions = {
      center: new google.maps.LatLng(lat || 47.624, lng || 237.664),
      mapTypeId: type || google.maps.MapTypeId.ROADMAP,
      zoom: zoom || 12
    };
    NS.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    NS.directionsRenderer = new google.maps.DirectionsRenderer();
    NS.directionsRenderer.setPanel(document.getElementById('directions-panel'));
    NS.directionsRenderer.setMap(map);
    NS.directionsService = new google.maps.DirectionsService();
    NS.placesService = new google.maps.places.PlacesService(map);
    NS.routeBoxer = new RouteBoxer();
    NS.infoWindow = new google.maps.InfoWindow();

    //google.maps.event.addDomListener(window, 'load', initialize);
  };

})(window.googleMaps = window.googleMaps || {});