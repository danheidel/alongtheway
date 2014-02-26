
      var directionsDisplay, map, infoWindow;
      var directionsService = new google.maps.DirectionsService();
      var markerSet = [];
      var savePoints = [];
      var scanRadius = 10000; //distancce in meters

      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(47.624, 237.664),
          zoom: 16
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
        infoWindow = new google.maps.InfoWindow();
      }

      function calcRoute() {
        var start = document.getElementById('routeStart').value;
        var end = document.getElementById('routeEnd').value;
        var request = {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(result, status) {
          if(status == google.maps.DirectionsStatus.OK){
            directionsDisplay.setDirections(result);
            var routeInfo = result.routes[0].legs[0];
            console.log(result);
            showSteps(routeInfo);
          }
        });
      }

      function showSteps(routeInfo){
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
            if(compDist(tempPoint, savePoints[savePoints.length - 1]) > scanRadius){
              savePoints.push(tempPoint);
            }
          }
          //place map markers
          marker = new google.maps.Marker({
            position: routeInfo.steps[rep].start_point,
            map: map,
            animation: google.maps.Animation.BOUNCE
          });
          attachMarkerData(marker, routeInfo.steps[rep]);
          markerSet[rep] = marker;

          for(rep2=0;rep2<savePoints.length;rep2++){
            //place map markers at eath search point
            marker = new google.maps.Marker({
              position: savePoints[rep2],
              map: map
            });
            attachMarkerData(marker, routeInfo.steps[rep2]);
            markerSet[rep2] = marker;
          }
        }
        console.log(savePoints);

        // for(rep=0;rep<30;rep++){
        //   console.log(savePoints[rep]);
        //   console.log(compDist(savePoints[rep * 10], savePoints[(rep+1) * 10]));
        // }
        console.log('length: ' + savePoints.length);
        console.log(savePoints[0]);
      }

      function attachMarkerData(marker, step){
        google.maps.event.addListener(marker, 'click', function(){
          infoWindow.setContent(step.instructions + '\n    distance: ' + step.distance.text + '\n    start lat: ' + step.start_point.e + '\n long: ' + step.start_point.d + '\n encoded data: ' + google.maps.geometry.encoding.decodePath(step.encoded_lat_lngs));
          infoWindow.open(map, marker);
        });
      }

      google.maps.event.addDomListener(window, 'load', initialize);