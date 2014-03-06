(function(NS){
  'use strict';
  /*global _*/
  NS.mode = {
    hasRoute: false,
    hasPlaces: false,
    hasLocation: false,
    gettingSubRouteStart: false,
    gettingSubRouteEnd: false,
    gettingFakeGeo: false
  };
  NS.userLocation = {};
  NS.pathFilterMode = 'wholeRoute'; //default value
  NS.routeObject = {};

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
        NS.routeObject.queryPoints = NS.routeObject.savePoints;
      }else if(mode === 'twoPoints'){
        //stuff happens
        var halfway = NS.routeObject.savePoints.length * 0.9;
        NS.routeObject.queryPoints = [];
        _.each(NS.routeObject.savePoints, function(element, index){
          if(index > halfway){
            NS.routeObject.queryPoints.push(element);
          }
        });
      }else if(mode === 'pointDelta'){
        //other stuff happens
      }
      //call the draw callback when done
      drawCallback(NS.routeObject);
    }
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