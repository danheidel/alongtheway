(function(NS){
  'use strict';
  /*global _*/
  /*global google*/

  NS.mode = {
    hasRoute: false,
    hasPlaces: false,
    hasLocation: false,
    geoLocActive: true,
    gettingSubRouteMode: 'none',
  };
  NS.userLocation = {};
  NS.pathFilterMode = 'wholeRoute'; //default value
  NS.pathFilterCallback = {};
  NS.pathFilterDrawCallback = {};
  NS.pathFilterPoints = [];
  NS.routeObject = {};

  NS.placesObject = {
    places: [],
    placesHTML: [],
    placesReferences: [],
  };

  NS.startGeoLocation = function() {
    setInterval(function(){
      if(NS.mode.geoLocActive === true){
        window.geolocation.getGeoLocation();
      }
      if(NS.mode.hasLocation){
        NS.onLocationChange(NS.userLocation);
        window.gpView.showUserLocation(NS.userLocation);
      }
    },2000);
  };


  NS.getRoute = function(routeRequestObject){
    var callback = function(result){
      NS.routeObject  = result;
      //alert('got the route');
    };

    window.pathGen.calcRoute(routeRequestObject, callback);
  };

  NS.onPathFilterChange = function(mode, drawCallback){
    NS.pathFilterMode = mode;
    if(NS.mode.hasRoute){
      if(mode === 'wholeRoute'){
        NS.mode.gettingSubRouteMode = 'none';
        NS.routeObject.queryPoints = NS.routeObject.savePoints;
        drawCallback(NS.routeObject);
      }else if(mode === 'twoPoints'){
        //begin definition of start/end point of query
        NS.mode.gettingSubRouteMode = 'start';
        NS.pathFilterCallback = window.query.pointToPoint;
        NS.pathFilterDrawCallback = drawCallback;
      }else if(mode === 'pointDelta'){
        //start point to delta mode
        NS.mode.gettingSubRouteMode = 'delta';
        NS.pathFilterCallback = window.query.pointPlusDelta;
        NS.pathFilterDrawCallback = drawCallback;
      }
    }
  };

  NS.getPlaces = function(placesRequestObject){
    window.places_gen.getPlaces(NS.routeObject.queryPoints, placesRequestObject);
  };

  NS.onLocationChange = function(latLng){
    if(NS.mode.hasLocation){
      if(NS.mode.gettingSubRouteMode === 'delta'){
        //we are in search-ahead mode
        NS.routeObject.queryPoints = NS.pathFilterCallback(latLng, NS.routeObject.savePoints, 2500, null);
        NS.pathFilterDrawCallback(NS.routeObject);
      }
    }
  };

  NS.mapClick = function(event){
    console.log(event.latLng);
    console.log(window.query.pointToPath(event.latLng, NS.routeObject.savePoints));
    if(NS.mode.gettingFakeGeo){
      //this click is to define the current user location
      NS.userLocation = event.latLng;
      NS.mode.hasLocation = true;
      window.gpView.showUserLocation(NS.userLocation);
      NS.onLocationChange(NS.userLocation);
    }
    if(NS.mode.gettingSubRouteMode === 'end'){
      //this click is to define the subset of the route for place searches
      NS.pathFilterPoints.push(event.latLng);
      NS.mode.gettingSubRouteMode = 'none';
      NS.routeObject.queryPoints = window.query.pointToPoint(NS.pathFilterPoints[0], NS.pathFilterPoints[1], NS.routeObject.savePoints);
      NS.pathFilterDrawCallback(NS.routeObject);
    }
    if(NS.mode.gettingSubRouteMode === 'start'){
      //this click is to define the subset of the route for place searches
      NS.pathFilterPoints = [];
      NS.pathFilterPoints.push(event.latLng);
      NS.mode.gettingSubRouteMode = 'end';
      NS.routeObject.queryPoints = window.query.pointToPoint(NS.pathFilterPoints[0], NS.routeObject.savePoints[NS.routeObject.savePoints.length - 1], NS.routeObject.savePoints);
      NS.pathFilterDrawCallback(NS.routeObject);
    }
  };

})(window.controller = window.controller || {});