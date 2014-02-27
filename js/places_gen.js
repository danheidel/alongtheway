window.places_gen = (function() {

  var output = {};

  output.place_results = [];
  output.promises =[];
  output.map = null;
  output.boxpolys = null;
  output.directions = null;
  output.routeBoxer = null;
  output.distance = null; // km
  output.service = null;
  output.gmarkers = [];
  output.infowindow = new google.maps.InfoWindow();

  $(document).on('test', function(e,data){
    // console.log(data);
  });


  output.initialize = function initialize(value) {
    // Default the map view to the continental U.S.
    var mapOptions = {
      center: new google.maps.LatLng(40,-80.5),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 8
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    service = new google.maps.places.PlacesService(map);

    routeBoxer = new RouteBoxer();

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
  }

    output.route = function route() {
    // Clear any previous route boxes from the map
    clearBoxes();

    // Convert the distance to box around the route from miles to km
    distance = parseFloat(document.getElementById("distance").value) * 1.609344;

    var request = {
      origin: document.getElementById("routeStart").value,
      destination: document.getElementById("routeEnd").value,
      travelMode: google.maps.TravelMode.DRIVING
    }

    // Make the directions request
    directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);

        // Box around the overview path of the first route
        var path = result.routes[0].overview_path;
        var boxes = routeBoxer.box(path, distance);
        console.log("boxes: ", boxes);
        // alert(boxes.length);
        output.drawBoxes(boxes);
        $.search(boxes,0).then(function(results) {
          console.log(results);
        });
      } else {
        alert("Directions query failed: " + status);
      }
    });
  }




  // Draw the array of boxes as polylines on the map
  output.drawBoxes = function drawBoxes(boxes) {
    output.boxpolys = new Array(boxes.length);
    for (var i = 0; i < boxes.length; i++) {
      output.boxpolys[i] = new google.maps.Rectangle({
        bounds: boxes[i],
        fillOpacity: 0,
        strokeOpacity: 1.0,
        strokeColor: '#000000',
        strokeWeight: 1,
        map: map
      });
    }
  }

  function showPlaces() {
    var promises = [];
    not_Done =[];

    var index=0;

    console.log(output.place_results.length);
    setInterval(function() {
      if (index >= output.place_results.length){
        return;
      }
      index++;
      service.getDetails({reference:output.place_results[index]}, function(place, status){
        console.log(index, place.name, place.adr_address, place.formatted_phone_number, status);
      });
    }, 500);

  };

  output.showPlaces_trigger = function showPlaces_trigger() {
    $.when(showPlaces()).then(function(results){
      console.log("not done",not_Done);
      console.log("results", results);
    });
  }

  $.search = function (boxes) {

      function findNextPlaces(place_results, searchIndex) {
          var dfd = $.Deferred();
          if (searchIndex < boxes.length) {
              // service.nearbySearch({
              service.radarSearch({
                  bounds: boxes[searchIndex],
                  types: ["food"]
                  // keyword: ["coffee"],
                  // rankBy: google.maps.places.RankBy.DISTANCE
              }, function (results, status) {
                  if (status != google.maps.places.PlacesServiceStatus.OK) {
                      return dfd.reject("Request["+searchIndex+"] failed: "+status);
                  }
                  console.log( "bounds["+searchIndex+"] returns "+results.length+" results" );
                  for (var i = 0, result; result = results[i]; i++) {
                      var marker = createMarker(result);
                      output.place_results.push(result.reference); // marker?
                      $(document).trigger('test', result.reference);
                  }
                  dfd.resolve(output.place_results, searchIndex+1);
              });
              return dfd.then(findNextPlaces);
          }
          else {
              return dfd.resolve(output.place_results).promise();
          }
      }

      return findNextPlaces(output.place_results, 0);

  }

  $.getNames = function(results){

    function findNames(temp, searchIndex) {
      var dfd = $.Deferred();
      if (searchIndex < results.length){
        service.getDetails({reference:results[searchIndex]
        }, function(place){
          temp.push(place);
          dfd.resolve(temp, searchIndex+1);
        });
        return dfd.then(findNames);
      }
      else {
        return dfd.resolve(temp).promise();
      }
    }
    return findNames([], 0);

  }


  // Clear boxes currently on the map
  function clearBoxes() {
    if (output.boxpolys != null) {
      for (var i = 0; i < output.boxpolys.length; i++) {
        output.boxpolys[i].setMap(null);
      }
    }
    output.boxpolys = null;
  }

  function createMarker(place){
      // console.log(place);
      // service.getDetails({reference:place.reference}, function(thiss){
      //   console.log(thiss);
      // });

      var placeLoc=place.geometry.location;
      if (place.icon) {
        var image = new google.maps.MarkerImage(
                  place.icon, new google.maps.Size(71, 71),
                  new google.maps.Point(0, 0), new google.maps.Point(17, 34),
                  new google.maps.Size(25, 25));
       } else var image = null;

      var marker=new google.maps.Marker({
          map:map,
          icon: image,
          position:place.geometry.location
      });
      var request =  {
            reference: place.reference
      };
      google.maps.event.addListener(marker,'click',function(){
          service.getDetails(request, function(place, status) {
            console.log(place,status);
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              var contentStr = '<h5>'+place.name+'</h5><p>'+place.formatted_address;
              if (!!place.formatted_phone_number) contentStr += '<br>'+place.formatted_phone_number;
              if (!!place.website) contentStr += '<br><a target="_blank" href="'+place.website+'">'+place.website+'</a>';
              contentStr += '<br>'+place.types+'</p>';
              output.infowindow.setContent(contentStr);
              output.infowindow.open(map,marker);
            } else {
              var contentStr = "<h5>No Result, status="+status+"</h5>";
              output.infowindow.setContent(contentStr);
              output.infowindow.open(map,marker);
            }

            var newRoute = {
              origin: document.getElementById("from").value,
              destination: place.formatted_address,
              travelMode: google.maps.DirectionsTravelMode.WALKING
            }

            directionsService.route(newRoute, function(result, status) {
              if (status == google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);

                // Box around the overview path of the first route
                var path = result.routes[0].overview_path;
                var boxes = routeBoxer.box(path, distance);
                // alert(boxes.length);
                output.drawBoxes(boxes);
                $.search(boxes,0).then(function(results) {
                  // console.log(results);
                });
              } else {
                alert("Directions query failed: " + status);
              }
            });

            var anotherRequest = {
              origin: document.getElementById("from").value,
              destination: place.formatted_address,
              travelMode:google.maps.TravelMode.DRIVING
            }

            directionsService.route(anotherRequest, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                  directionsDisplay.setDirections(response);
                }
              });



          });

      });
      output.gmarkers.push(marker);
      var side_bar_html = "<a href='javascript:google.maps.event.trigger(output.gmarkers["+parseInt(output.gmarkers.length-1)+"],\"click\");'>"+place.name+"</a><br>";
      document.getElementById('side_bar').innerHTML += side_bar_html;
  }


  return output;

})();

