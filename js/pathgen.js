(function(NS){
  NS.calcRoute = function(callback, start, end, iPointDist, mode) {
    var map = window.googleMaps.map;
    var directionsRenderer = window.googleMaps.directionsRenderer;
    var directionsService = window.googleMaps.directionsService;
    var infoWindow = window.googleMaps.infoWindow;
    var pointDist = iPointDist || 10000;
    var request = {
      origin: start,
      destination: end,
      travelMode: mode || google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
      if(status == google.maps.DirectionsStatus.OK){
        directionsRenderer.setDirections(result);
        var routeInfo = result.routes[0].legs[0];
        showSteps(callback, routeInfo, pointDist);
      }
    });
  };

  function showSteps(callback, routeInfo, pointDist){
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
    // console.log(savePoints);
    // console.log('length: ' + savePoints.length);
  }

})(window.pathGen = window.pathGen || {});