(function(NS){
  'use strict';
  NS.mode = {
    hasRoute: false,
    hasPlaces: false,
    hasLocation: false,
    gettingSubRouteStart: false,
    gettingSubRouteEnd: false,
    gettingFakeGeo: false
  };
  NS.userLocation = {};
  NS.routeObject = {};

  NS.getRoute = function(routeRequestObject){
    var callback = function(result){
      NS.routeObject  = result;
      //alert('got the route');
    };

    window.pathGen.calcRoute(routeRequestObject, callback);
  };

  NS.getPlaces = function(placesRequestObject){
    window.places_gen.getPlaces(NS.routeObject.queryPoints, placesRequestObject);
  };

  NS.mapClick = function(event){
    console.log(event.latLng);
    console.log(window.query.pointToPath(event.latLng, NS.routeObject.savePoints));
    if(NS.mode.gettingFakeGeo){
      //this click is to define the current user location
      NS.userLocation = event.latLng;
      NS.mode.gettingFakeGeo = false;
      NS.mode.hasLocation = true;
      window.gpView.showUserLocation(NS.userLocation);
    }
    if(NS.mode.gettingSubRouteStart){
      //this click is to define the subset of the route for place searches

    }
    if(NS.mode.gettingSubRouteEnd){
      //this click is to define the subset of the route for place searches

    }
  };

})(window.controller = window.controller || {});