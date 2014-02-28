(function(NS){
  NS.calcRoute = function(callback, start, end, iPointSpacing, mode) {
    var map = window.googleMaps.map;
    var directionsRenderer = window.googleMaps.directionsRenderer;
    var directionsService = window.googleMaps.directionsService;
    var infoWindow = window.googleMaps.infoWindow;
    var pointSpacing = iPointSpacing || 10000;
    var request = {
      origin: start,
      destination: end,
      travelMode: mode || google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
      if(status == google.maps.DirectionsStatus.OK){
        directionsRenderer.setDirections(result);
        var routeInfo = result.routes[0].legs[0];
        showSteps(callback, routeInfo, pointSpacing);
      }else{
        callback('something went wrong with the google maps search');
      }
    });
  };

  function showSteps(callback, routeInfo, pointSpacing){
    //flush old data
    var rep, rep2, stepPath, stepDist, stepTime;
    var compDist = google.maps.geometry.spherical.computeDistanceBetween;
    var LatLng = google.maps.LatLng;
    var tempPointArray, tempTotalDelta, tempFracDelta, tempAdditiveTime, tempAdditiveDist;
    var savePoints = [];

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
      // console.log('step length: ' + routeInfo.steps[rep].distance.value);
      // console.log('total step delta: ' + tempTotalDelta);
      // console.log((routeInfo.steps[rep].distance.value - tempTotalDelta) / tempTotalDelta * 100);

      savePoints.push(tempPointArray[0]);  //push first element
      tempAdditiveDist = tempPointArray[0].pointDist;
      tempAdditiveTime = tempPointArray[0].pointTime;
      for(rep2 = 1;rep2 < tempPointArray.length;rep2 ++){
        tempAdditiveDist += tempPointArray[rep2].pointDist;
        tempAdditiveTime += tempPointArray[rep2].pointTime;
        //if the accumulated point distance from last saved point is > pointSpacing, save a point
        if(tempAdditiveDist > pointSpacing){
          tempPointArray[rep2].pointDist = tempAdditiveDist;
          tempPointArray[rep2].pointTime = tempAdditiveTime;
          savePoints.push(tempPointArray[rep2]);
          tempAdditiveDist = 0;
          tempAdditiveTime = 0;
        }
      }
    }
    //run through the entire list of saved points and make their time and distance values additive from the route start
    for(rep = 1;rep < savePoints.length;rep ++){
      savePoints[rep].pointDist += savePoints[rep - 1].pointDist;
      savePoints[rep].pointTime += savePoints[rep - 1].pointTime;
    }
    callback(savePoints);
    // console.log(savePoints);
    // console.log('length: ' + savePoints.length);
  }

})(window.pathGen = window.pathGen || {});