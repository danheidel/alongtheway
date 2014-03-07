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
  NS.pathFilterCallback = {};
  NS.pathFilterDrawCallback = {};
  NS.pathFilterPoints = [];
  NS.routeObject = {};

  NS.placesObject = {
    places: [],
    placesHTML: [],
    placesReferences: [],
  }

  NS.geoLocActive=[];
  NS.geolocation=[];
  NS.geolocationMarker=[];

  NS.startGeoLocation = function() {
    var marker;
    setInterval(function(){
      window.geolocation.getGeoLocation();
      if (marker){
        marker.setMap(null);
      }
      if (NS.geolocation!=[] && NS.geoLocActive==true){
          marker = new google.maps.Marker({
          position: NS.geolocation,
          map: window.googleMaps.map,
          title: 'Hello World!'
        });
      }
    },500);
  }


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
        drawCallback(NS.routeObject);
      }else if(mode === 'twoPoints'){
        //stuff happens
        NS.mode.gettingSubRouteStart = true;
        NS.pathFilterCallback = window.query.pointToPoint;
        NS.pathFilterDrawCallback = drawCallback;
        // var halfway = NS.routeObject.savePoints.length * 0.9;
        // NS.routeObject.queryPoints = [];
        // _.each(NS.routeObject.savePoints, function(element, index){
        //   if(index > halfway){
        //     NS.routeObject.queryPoints.push(element);
        //   }
        // });
      }else if(mode === 'pointDelta'){
        //other stuff happens
      }
      //call the draw callback when done
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
    if(NS.mode.gettingSubRouteEnd){
      //this click is to define the subset of the route for place searches
      NS.pathFilterPoints.push(event.latLng);
      NS.mode.gettingSubRouteEnd = false;
      NS.routeObject.queryPoints = window.query.pointToPoint(NS.pathFilterPoints[0], NS.pathFilterPoints[1], NS.routeObject.savePoints);
      NS.pathFilterDrawCallback(NS.routeObject);
    }
    if(NS.mode.gettingSubRouteStart){
      //this click is to define the subset of the route for place searches
      NS.pathFilterPoints = [];
      NS.pathFilterPoints.push(event.latLng);
      NS.mode.gettingSubRouteStart = false;
      NS.mode.gettingSubRouteEnd = true;
    }
  };

})(window.controller = window.controller || {});