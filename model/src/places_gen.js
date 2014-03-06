window.places_gen = (function() {

  var public = {};
  public.html_out =[];
  public.place_results = [];
  public.boxpolys = null;
  public.gmarkers = [];
  public.infowindow = new google.maps.InfoWindow();
  failed_Indexes =[];
  failed_pl_Queries =[];

  function timeDelay(value){
    var dfd = $.Deferred();
    setTimeout(function(value) {
      dfd.resolve();
    }, value);
    return dfd.promise();
  }

  public.initialize = function initialize() {
  };

  public.getPlaces = function(latLngArray, queryObject){
    var width = queryObject.width;
    var query = queryObject.query;
    var displayCallback = queryObject.drawPlaces;

    var routeBoxer = window.googleMaps.routeBoxer;
    var boxes = routeBoxer.box(latLngArray, width);
    console.log('boxes: ', boxes);
    //this is calling the drawBoxes function passed from the view
    if(queryObject.drawBoxes){
      queryObject.drawBoxes(boxes);
    }
    //public.drawBoxes(boxes);
    $.search(queryObject, boxes,1000).then(function(results) {
      // public.showPlaces(500);
      var resultsQuery = queryObject.getLength();
      console.log(resultsQuery.places, "places.length: ", resultsQuery.places_length);
    });
    public.showPlaces(queryObject);
  };

  public.showPlaces = function showPlaces(queryObject, decrement) {
    var html_out =[];
    var index=0;
    var timer_VAL1;
    var service = window.googleMaps.placesService;
    console.log("place results length", public.place_results.length);

    function getDetails(place_) {
      var dfd = $.Deferred();
      service.getDetails({reference:place_}, function(place, status){
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          failed_pl_Queries.push({id:index, reference:public.place_results[index]});
          console.log(failed_pl_Queries);
          dfd.reject("failed!!!", place_);
        }
        else {
          console.log("getDetails: ", status, "index: ", index);
          dfd.resolve(place);
          };
        });
      return dfd.promise();
    }

    function startQuery(timerVal) {      
      //unfortunately this has to be removed - the query limit is too much
      // if (timerVal>=2000){
      //   timerVal-=500;
      //   console.log(timerVal);
      // } 
      var queryLimit = setInterval(function() {
        var dfd = $.Deferred();
        if (index>=public.place_results.length-1) return;
        index++;
          getDetails(public.place_results[index]).then(function(result) {
            $(document).on('stop', function() {
              clearInterval(queryLimit);
              return;
            });
            var details = {
              place:result.name,
              address:result.formatted_address,
              phoneNum:result.formatted_phone_number,
              pngICON:result.icon,
              price_level:result.price_level,
              rating:result.rating,
              url:result.url,
              website:result.website
            };
            if (index <= 2000){
                queryObject.getDetails(index, result);
                var source = $('#places-template').html();
                var template = Handlebars.compile(source)
                var html = template(details);
                queryObject.getDetailsHTML(index, html);
            }
            public.html_out.push(details);
          },function(error, place){
            console.log("Way too fast!",place);
            clearInterval(queryLimit);
            startQuery(timerVal+=500);
            timer_VAL1 = timerVal;
          });
      }, timerVal);
    }

    if (queryObject){
      startQuery(500);
    }

    if (decrement){
      startQuery(timer_VAL1-=decrement);
    }

  };

  $.search = function (queryObject, boxes, timerVal) {
      var toggle = false;
      $(document).on('stopASYNC', function() {
        toggle = true;
      });
      function findNextPlaces(place_results, searchIndex) {
          if (toggle) return;
          var dfd = $.Deferred();
          var service = window.googleMaps.placesService;
          if (searchIndex < boxes.length) {
              // service.nearbySearch({
              service.radarSearch({
                  bounds: boxes[searchIndex],
                  // types: ["food"]
                  keyword: [queryObject.query],
                  // rankBy: google.maps.places.RankBy.DISTANCE
              }, function (results, status) {
                  if (status != google.maps.places.PlacesServiceStatus.OK  && status === 'OVER_QUERY_LIMIT') {
                      timerVal+=3000;
                      console.log("searchIndex: ", searchIndex);
                      if (_.contains(failed_Indexes, searchIndex) === false){
                        failed_Indexes.push(searchIndex);
                        console.log(failed_Indexes);
                        console.log("failed!: boxes:",searchIndex, failed_Indexes);
                        timeDelay(timerVal).then(function() {
                          //will need to change the keyword to match above but haven't had time to check scoping
                          service.radarSearch({bounds: boxes[searchIndex], keyword: ['thai']}, function(results1, status){
                            console.log("finished: ", searchIndex, results1, "results.length= ", results1.length);
                            for (var i = 0, result; result = results[i]; i++) {
                                public.place_results.push(result.reference); 
                            }                    
                            queryObject.drawMarkers(results1);
                          });
                        });
                      }
                  }
                  if (status != 'OVER_QUERY_LIMIT'){
                    console.log(status);
                    console.log( "bounds["+searchIndex+"] returns "+results.length+" results" );
                    for (var i = 0, result; result = results[i]; i++) {
                        public.place_results.push(result.reference); 
                    }                    
                    queryObject.drawMarkers(results)
                  }
                  dfd.resolve(public.place_results, searchIndex+1);
              });
                return timeDelay(timerVal).then(function() {
                        return dfd.then(findNextPlaces);
                      });
            }
          else {
            return dfd.resolve(public.place_results).promise();
          }
      }
    return findNextPlaces(public.place_results, 0);
  }

  public.generateDirections = function generateDirections (clickedMarkerDEST) {
    //Attach directions to a particular marker by first defining a route
    //from original destination
    window.googleMaps.directionsService.route(clickedMarkerDEST, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        window.googleMaps.directionsRenderer.setDirections(result);
      }
      else {
        alert("Directions query failed: " + status);
      }
    });
  }

  public.displayDirections = function displayDirections (clickedMarkerDEST) {
  //Display these directions on the DOM
    window.googleMaps.directionsService.route(clickedMarkerDEST, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          $('#directions-panel').empty();
          window.googleMaps.directionsRenderer.setDirections(response);
        }
      });
  }

  return public;
})();