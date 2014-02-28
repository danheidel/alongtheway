window.places_gen = (function() {

  var public = {};
  public.html_out =[];
  public.place_results = [];
  public.boxpolys = null;
  public.gmarkers = [];
  public.infowindow = new google.maps.InfoWindow();
  failed_Queries =[];
  failed_pl_Queries =[];

  public.initialize = function initialize(value) {
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

  public.route = function route() {
    $('.places ul').empty();
    clearBoxes();

    // Convert the distance to box around the route from miles to km
    distance = parseFloat(document.getElementById("distance").value) * 1.609344;

    var request = {
      origin: document.getElementById("routeStart").value,
      destination: document.getElementById("routeEnd").value,
      //TRANSIT YIELDS MUCH DIFFERENT RESULTS OVER LONG PATHS!
      travelMode: google.maps.TravelMode.TRANSIT
    }
    // Make the directions request
    directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);

        // Box around the overview path of the first route
        var path = result.routes[0].overview_path;
        var boxes = routeBoxer.box(path, distance);
        console.log("boxes: ", boxes);
        public.drawBoxes(boxes);
        $.search(boxes,0).then(function(results) {
          console.log(results);
          public.showPlaces();
        }), function(error) {
          console.log(error);
        };
      } 
      else {
        alert("Directions query failed: " + status);
      }
    });
  }

  // Draw the array of boxes as polylines on the map
  public.drawBoxes = function drawBoxes(boxes) {
    public.boxpolys = new Array(boxes.length);
    for (var i = 0; i < boxes.length; i++) {
      public.boxpolys[i] = new google.maps.Rectangle({
        bounds: boxes[i],
        fillOpacity: 0,
        strokeOpacity: 1.0,
        strokeColor: '#000000',
        strokeWeight: 1,
        map: map
      });
    }
  }

  public.showPlaces = function showPlaces() {
    var html_out =[];
    var index=0;
    console.log("place results length", public.place_results.length);

    setInterval(function() {
      if (index>=public.place_results.length) return;
      index++;
      service.getDetails({reference:public.place_results[index]}, function(place, status){
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          failed_pl_Queries.push({id:index, reference:public.place_results[index]});
          console.log(failed_pl_Queries);
        }
        else {console.log("getDetails: ", status)};

        var details = {place:place.name, 
          address:place.adr_address, 
          phoneNum:place.formatted_phone_number
        };
        if (index <= 10){
            var source = $('#places-template').html();
            var template = Handlebars.compile(source)
            var html = template(details);
            $('.places').append(html);
        }
        public.html_out.push(details);
      });
    }, 500);
  };

  //////HelperMethod
  $(document).on('test', function(e,data){
    // console.log(data);
  });
  $.search = function (boxes) {
      function findNextPlaces(place_results, searchIndex) {
          var dfd = $.Deferred();
          if (searchIndex < boxes.length) {
              // service.nearbySearch({
              service.radarSearch({
                  bounds: boxes[searchIndex],
                  // types: ["food"]
                  keyword: ["coffee"],
                  // rankBy: google.maps.places.RankBy.DISTANCE
              }, function (results, status) {
                  console.log(status);
                  if (status != google.maps.places.PlacesServiceStatus.OK  && status === 'OVER_QUERY_LIMIT') {
                      failed_Queries.push(boxes[searchIndex]);
                      console.log("failed!: boxes:",searchIndex, failed_Queries);
                      // return dfd.reject("Request["+searchIndex+"] failed: "+status);
                  }
                  console.log( "bounds["+searchIndex+"] returns "+results.length+" results" );
                  for (var i = 0, result; result = results[i]; i++) {
                      var marker = createMarker(result);
                      public.place_results.push(result.reference); // marker?
                      $(document).trigger('test', result.reference);
                  }
                  dfd.resolve(public.place_results, searchIndex+1);
              });
              return dfd.then(findNextPlaces);
          }
          else {
              return dfd.resolve(public.place_results).promise();
          }
      }
    return findNextPlaces(public.place_results, 0);
  }

  // Clear boxes currently on the map
  function clearBoxes() {
    if (public.boxpolys != null) {
      for (var i = 0; i < public.boxpolys.length; i++) {
        public.boxpolys[i].setMap(null);
      }
    }
    public.boxpolys = null;
  }

  function createMarker(place){
      var placeLoc=place.geometry.location;
      if (place.icon) {
        var image = new google.maps.MarkerImage(
                  place.icon, new google.maps.Size(71, 71),
                  new google.maps.Point(0, 0), 
                  new google.maps.Point(17, 34),
                  new google.maps.Size(12, 12));
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
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            var contentStr = '<h5>'+place.name+'</h5><p>'+place.formatted_address;
            if (!!place.formatted_phone_number) contentStr += '<br>'+place.formatted_phone_number;
            if (!!place.website) contentStr += '<br><a target="_blank" href="'+place.website+'">'+place.website+'</a>';
            contentStr += '<br>'+place.types+'</p>';
            public.infowindow.setContent(contentStr);
            public.infowindow.open(map,marker);
          } else {
            var contentStr = "<h5>No Result, status="+status+"</h5>";
            public.infowindow.setContent(contentStr);
            public.infowindow.open(map,marker);
          }
          generateDirections(place);
          displayDirections(place);
        });
      });

      public.gmarkers.push(marker);
      var side_bar_html = "<a href='javascript:google.maps.event.trigger(public.gmarkers["+parseInt(public.gmarkers.length-1)+"],\"click\");'>"+place.name+"</a><br>";
      document.getElementById('side_bar').innerHTML += side_bar_html;
  }

  function generateDirections (place) {
    //Attach directions to a particular marker by first defining a route
    //from original destination
    var clickedMarkerDEST = {
      origin: document.getElementById("routeStart").value,
      destination: place.formatted_address,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    }
    directionsService.route(clickedMarkerDEST, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
      } 
      else {
        alert("Directions query failed: " + status);
      }
    });
  }

  function displayDirections (place) {
  //Display these directions on the DOM
    var directionsDISPLAY = {
      origin: document.getElementById("routeStart").value,
      destination: place.formatted_address,
      travelMode:google.maps.TravelMode.DRIVING
    }
    directionsService.route(directionsDISPLAY, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          $('#directions-panel').empty();
          directionsDisplay.setDirections(response);
        }
      });
  }

  return public;
})();