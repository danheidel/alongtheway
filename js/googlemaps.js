(function(NS){

  NS.initialize = function(lat, lng, zoom, type){
    var mapOptions = {
      center: new google.maps.LatLng(lat || 47.624, lng || 237.664),
      mapTypeId: type || google.maps.MapTypeId.ROADMAP,
      zoom: zoom || 12,
      scaleControl: true
    };
    NS.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    NS.directionsService = new google.maps.DirectionsService();
    NS.directionsRenderer = new google.maps.DirectionsRenderer();
    NS.directionsRenderer.setPanel(document.getElementById('directions-panel'));
    NS.directionsRenderer.setMap(NS.map);
    NS.placesService = new google.maps.places.PlacesService(NS.map);
    NS.routeBoxer = new RouteBoxer();
    NS.infoWindow = new google.maps.InfoWindow();

    //google.maps.event.addDomListener(window, 'load', initialize);
  };

})(window.googleMaps = window.googleMaps || {});