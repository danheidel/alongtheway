(function(NS){
  var map = window.googleMaps.map;
  var directionRenderer = window.googleMaps.directionRenderer;
  var directionsService = window.googleMaps.directionsService;
  var infoWindow = window.googleMaps.infoWindow;
  var pointDist = 10000;
  var markerSet = [];
  var savePoints = [];

  NS.calcRoute = function(latLngArray, start, end, iPointDist, mode) {
    var request = {
      origin: start,
      destination: end,
      travelMode: mode || google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
      if(status == google.maps.DirectionsStatus.OK){
        directionRenderer.setDirections(result);
        var routeInfo = result.routes[0].legs[0];
        //console.log(result);
        showSteps(routeInfo, latLngArray);
      }
    });
  };

  function showSteps(routeInfo, latLngArray){
    //flush old data
    var rep, rep2, stepStart, stepEnd, stepLength, stepPath, lastPathPoint, marker;
    var compDist = google.maps.geometry.spherical.computeDistanceBetween;
    var LatLng = google.maps.LatLng;

    //wipe data from previous search
    savePoints = [];
    for(rep=0;rep<markerSet.length;rep++){
      markerSet[rep].setMap(null);
    }
    markerSet = [];

    //add new data
    for(rep=0;rep<routeInfo.steps.length;rep++){
      //populate the list of lat/long
      stepPath = routeInfo.steps[rep].path;
      savePoints.push(new LatLng(stepPath[0].d, stepPath[0].e));  //push first element
      for(rep2=1;rep2<stepPath.length;rep2++){
        var tempPoint = new LatLng(stepPath[rep2].d, stepPath[rep2].e);
        //only add path points if at least scandist away from the last pushed point
        if(compDist(tempPoint, savePoints[savePoints.length - 1]) > pointDist){
          savePoints.push(tempPoint);
        }
      }
    }
    console.log(savePoints);
    console.log('length: ' + savePoints.length);
  }

})(window.pathGen = window.pathGen || {});