(function(NS){
  var map = window.googlemaps.map;
  var directionsRenderer = window.googlemaps.directionsRenderer;
  var infoWindow = window.googlemaps.infoWindow;
  var pointDist = 10000;

  NS.calcRoute = function(callback, start, end, iPointDist, mode) {
    var request = {
      origin: start,
      destination: end,
      travelMode: mode || google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
      if(status == google.maps.DirectionsStatus.OK){
        directionsRenderer.setDirections(result);
        var routeInfo = result.routes[0].legs[0];
        showSteps(routeInfo, callback);
      }
    });
  };

  function showSteps(callback, routeInfo){
    //flush old data
    var rep, rep2, stepPath;
    var compDist = google.maps.geometry.spherical.computeDistanceBetween;
    var LatLng = google.maps.LatLng;
    var savePoints = [];

    //add new data
    for(rep=0;rep<routeInfo.steps.length;rep++){
      //populate the list of lat/long
      stepPath = routeInfo.steps[rep].path;
      savePoints.push(new LatLng(stepPath[0].d, stepPath[0].e));  //push first element
      for(rep2=1;rep2<stepPath.length;rep2++){
        var tempPoint = new LatLng(stepPath[rep2].d, stepPath[rep2].e);
        //only add path points if at least pointDist away from the last pushed point
        if(compDist(tempPoint, savePoints[savePoints.length - 1]) > pointDist){
          savePoints.push(tempPoint);
        }
      }
    }
    callback(savePoints);
    console.log(savePoints);
    console.log('length: ' + savePoints.length);
  }

})(window.pathGen = window.pathGen || {});