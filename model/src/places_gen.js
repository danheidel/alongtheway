window.places_gen = (function() {
  'use strict';
  /*global google*/
  /*global $*/
  /*global Handlebars*/
  /*global _*/
  /*global alert*/

  var _public = {};
  _public.html_out =[];
  _public.place_results = [];
  _public.boxpolys = null;
  _public.gmarkers = [];
  _public.infowindow = new google.maps.InfoWindow();
  var failed_Indexes =[];
  var failed_pl_Queries =[];
  var asyncToggle = true;

  function timeDelay(value){
    var dfd = $.Deferred();
    setTimeout(function(value) {
      dfd.resolve();
    }, value);
    return dfd.promise();
  }

  $(document).on('stopASYNC', function() {
    //stop all further async callbacks
    asyncToggle = false;
  });

  _public.initialize = function initialize() {
  };

  _public.getPlaces = function(latLngArray, queryObject){
    var width = queryObject.width;
    var query = queryObject.query;
    var displayCallback = queryObject.drawPlaces;

    window.nukeMarkers();
    var routeBoxer = window.googleMaps.routeBoxer;
    var boxes = routeBoxer.box(latLngArray, width);
    console.log('boxes: ', boxes);
    //this is calling the drawBoxes function passed from the view
    if(queryObject.drawBoxes){
      queryObject.drawBoxes(boxes);
    }
    //_public.drawBoxes(boxes);
    $.search(queryObject, boxes,1000).then(function(results) {
      // _public.showPlaces(500);
      var resultsQuery = queryObject.getLength();
      console.log(resultsQuery.places, 'places.length: ', resultsQuery.places_length);
    });
    //_public.showPlaces(queryObject);
  };

  // _public.getPlaces2 = function(latLngArray, queryObject, callback){
  //   var width = queryObject.width;
  //   var query = queryObject.query;
  //   var displayCallback = queryObject.drawPlaces;
  //   queryObject.nukeMarkers();

  //   //reset async mode
  //   asyncToggle = true;
  //   var routeBoxer = window.googleMaps.routeBoxer;
  //   var boxes = routeBoxer.box(latLngArray, width);
  //   console.log('boxes: ', boxes);
  //   //this is calling the drawBoxes function passed from the view
  //   if(queryObject.drawBoxes){
  //     queryObject.drawBoxes(boxes);
  //   }
  //   //_public.drawBoxes(boxes);
  //   doSearch(queryObject, boxes, 500, 0, callback);
  // };

  _public.showPlaces = function showPlaces(queryObject, decrement) {
    var html_out =[];
    var index=0;
    var timer_VAL1;
    var service = window.googleMaps.placesService;
    console.log('place results length', _public.place_results.length);

    function getDetails(place_) {
      var dfd = $.Deferred();
      service.getDetails({reference:place_}, function(place, status){
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          failed_pl_Queries.push({id:index, reference:_public.place_results[index]});
          console.log(failed_pl_Queries);
          dfd.reject('failed!!!', place_);
        }
        else {
          console.log('getDetails: ', status, 'index: ', index);
          dfd.resolve(place);
          }
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
        if (index>=_public.place_results.length-1) return;
        index++;
          getDetails(_public.place_results[index]).then(function(result) {
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
                var template = Handlebars.compile(source);
                var html = template(details);
                queryObject.getDetailsHTML(index, html);
            }
            _public.html_out.push(details);
          },function(error, place){
            console.log('Way too fast!',place);
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

  // function doSearch(queryObject, boxes, delayVal, index, callback){
  //   var service = window.googleMaps.placesService;
  //   if(index < boxes.length){
  //     var radarOptions = {
  //       bounds: boxes[index],
  //       keyword: [queryObject.query]
  //     };
  //     service.radarSearch(radarOptions, boxQuery.bind(null, queryObject, boxes, delayVal, index, callback));
  //     //call next box search with appropriate delay
  //     if(asyncToggle){
  //       setTimeout(doSearch, delayVal, queryObject, boxes, delayVal, index + 1, callback);
  //     }
  //   }
  // }

  // function boxQuery(queryObject, boxes, delayVal, index, callback, results, status){
  //   console.log('search box ' + (index + 1) + ' out of ' + boxes.length);
  //   if (status != google.maps.places.PlacesServiceStatus.OK && status === 'OVER_QUERY_LIMIT') {
  //     setTimeout(doSearch, boxes, delayVal * 3, index, callback);
  //     console.log('exceeded query limit, will requery box: ' + index);
  //   }
  //   if (status != 'OVER_QUERY_LIMIT'){
  //     console.log('returns '+results.length+' results ');
  //     for (var i = 0, result; result = results[i]; i++) {
  //       _public.place_results.push(result.reference);
  //     }
  //     queryObject.drawMarkers(results);
  //   }
  // }

  $.search = function (queryObject, boxes, timerVal) {
    var toggle = false;
    $(document).on('stopASYNC', function() {
      toggle = true;
    });

    function findNextPlaces(place_results, searchIndex) {
      if (toggle) return;
      var dfd = $.Deferred();
      var service = window.googleMaps.placesService;
      var radarOptions;

      if (searchIndex < boxes.length) {
        radarOptions = {
          bounds: boxes[searchIndex],
          keyword: [queryObject.query]
        };

        service.radarSearch(radarOptions, function (results, status) {
          if (status != google.maps.places.PlacesServiceStatus.OK && status === 'OVER_QUERY_LIMIT') {
            timerVal+=3000;
            console.log('searchIndex: ', searchIndex);
            if (_.contains(failed_Indexes, searchIndex) === false){
              failed_Indexes.push(searchIndex);
              console.log(failed_Indexes);
              console.log('failed!: boxes:',searchIndex, failed_Indexes);
              timeDelay(timerVal).then(function() {
                service.radarSearch({bounds: boxes[searchIndex], keyword: [queryObject.query]}, function(results1, status){
                  console.log('finished: ', searchIndex, results1, 'results.length= ', results1.length);
                  for (var i = 0, result; result = results[i]; i++) {
                    _public.place_results.push(result.reference);
                  }
                  queryObject.drawMarkers(results1);
                });
              });
            }
          }
          if (status != 'OVER_QUERY_LIMIT'){
            console.log(status);
            console.log( 'bounds['+searchIndex+'] returns '+results.length+' results' );
            for (var i = 0, result; result = results[i]; i++) {
              _public.place_results.push(result.reference);
            }
            queryObject.drawMarkers(results);
          }
          dfd.resolve(_public.place_results, searchIndex+1);
        });
          return timeDelay(timerVal).then(function() {
            return dfd.then(findNextPlaces);
          });
        }
      else {
        return dfd.resolve(_public.place_results).promise();
      }
    }
    return findNextPlaces(_public.place_results, 0);
  };

  _public.generateDirections = function generateDirections (clickedMarkerDEST) {
    //Attach directions to a particular marker by first defining a route
    //from original destination
    window.googleMaps.directionsService.route(clickedMarkerDEST, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        window.googleMaps.directionsRenderer.setDirections(result);
      }
      else {
        alert('Directions query failed: ' + status);
      }
    });
  };

  _public.displayDirections = function displayDirections (clickedMarkerDEST) {
  //Display these directions on the DOM
    window.googleMaps.directionsService.route(clickedMarkerDEST, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          $('#directions-panel').empty();
          window.googleMaps.directionsRenderer.setDirections(response);
        }
      });
  };

  return _public;
})();