(function(NS){
  'use strict';
  NS.calcRoute = function(requestObject, callback) {
    var start = requestObject.start;
    var end = requestObject.end;
    var pointSpacing = requestObject.width || 10000;
    var mode = requestObject.mode || google.maps.TravelMode.DRIVING;
    var map = window.googleMaps.map;
    var directionsRenderer = window.googleMaps.directionsRenderer;
    var directionsService = window.googleMaps.directionsService;
    var infoWindow = window.googleMaps.infoWindow;
    var request = {
      origin: start,
      destination: end,
      travelMode: mode
    };
    directionsService.route(request, function(result, status) {
      if(status == google.maps.DirectionsStatus.OK){
      if(requestObject.drawRoute){ requestObject.drawRoute(result); }
        //directionsRenderer.setDirections(result);
        showSteps(callback, result, pointSpacing);
      }else{
        callback('something went wrong with the google maps search');
      }
    });
  };

  function showSteps(callback, result, pointSpacing){
    //flush old data
    var routeInfo = result.routes[0].legs[0];
    var rep, rep2, stepPath, stepDist, stepTime;
    var compDist = google.maps.geometry.spherical.computeDistanceBetween;
    var LatLng = google.maps.LatLng;
    var tempPointArray, tempTotalDelta, tempFracDelta, tempAdditiveTime, tempAdditiveDist;
    result.savePoints = [];

    //add new data
    for(rep=0;rep<routeInfo.steps.length;rep++){
      //populate the list of lat/long
      stepPath = routeInfo.steps[rep].path;
      stepDist = routeInfo.steps[rep].distance.value; //distance in m
      stepTime = routeInfo.steps[rep].duration.value; //time in seconds
      tempPointArray = [];
      tempTotalDelta = 0;

      //make a temp array of all path points in the step with deltas
      //skip last point as it overlaps w/ first path point of next step
      for(rep2 = 0;rep2 < (stepPath.length - 1);rep2++){
        tempPointArray.push(stepPath[rep2]);
        tempPointArray[rep2].isStep = (rep2 === 0) ? true : false;
        tempPointArray[rep2].info = (rep2 === 0) ? routeInfo.steps[rep].instructions : '';
        if(rep2 > 0){
          //delta to next point
          tempTotalDelta +=
            tempPointArray[rep2 - 1].tempDelta =
            compDist(tempPointArray[rep2], tempPointArray[rep2 - 1]);
        }
      }
      //grab residual dist from 2nd to last point to actual step end
      tempTotalDelta +=
        tempPointArray[tempPointArray.length - 1].tempDelta =
        compDist(tempPointArray[tempPointArray.length - 1], routeInfo.steps[rep].end_point);

      //calculate delta fraction and fractional time and distance for each point
      for(rep2 = 0;rep2 < tempPointArray.length;rep2 ++){
        tempFracDelta = tempPointArray[rep2].tempDelta / tempTotalDelta;
        tempPointArray[rep2].pointDist = stepDist * tempFracDelta;
        tempPointArray[rep2].pointTime = stepTime * tempFracDelta;
      }

      result.savePoints.push(tempPointArray[0]);  //push first element
      tempAdditiveDist = tempPointArray[0].pointDist;
      tempAdditiveTime = tempPointArray[0].pointTime;
      for(rep2 = 1;rep2 < tempPointArray.length;rep2 ++){
        tempAdditiveDist += tempPointArray[rep2].pointDist;
        tempAdditiveTime += tempPointArray[rep2].pointTime;
        //if the accumulated point distance from last saved point is > pointSpacing, save a point
        if(tempAdditiveDist > pointSpacing){
          tempPointArray[rep2].pointDist = tempAdditiveDist;
          tempPointArray[rep2].pointTime = tempAdditiveTime;
          result.savePoints.push(tempPointArray[rep2]);
          tempAdditiveDist = 0;
          tempAdditiveTime = 0;
        }
      }
    }
    //run through the entire list of saved points and make their time and distance values additive from the route start
    for(rep = 1;rep < result.savePoints.length;rep ++){
      result.savePoints[rep].pointDist += result.savePoints[rep - 1].pointDist;
      result.savePoints[rep].pointTime += result.savePoints[rep - 1].pointTime;
    }
    result.queryPoints = result.savePoints.slice(0);

    console.log(result);
    var foo = result.savePoints[result.savePoints.length - 1];
    console.log('route dist: ' + routeInfo.distance.value + '  route time: ' + routeInfo.duration.value);
    console.log('points dist: ' + foo.pointDist + '  points time: ' + foo.pointTime);
    console.log('dist %diff: ' + ((routeInfo.distance.value - foo.pointDist)/routeInfo.distance.value * 100).toFixed(2) + '  time %diff: ' + ((routeInfo.duration.value - foo.pointTime)/routeInfo.duration.value * 100).toFixed(2));
    callback(result);
  }

})(window.pathGen = window.pathGen || {});