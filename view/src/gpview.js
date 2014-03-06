$(function(){
	'use strict';
  /*global alert*/
  /*global google*/
  /*global $*/

	var routeRequestObject = {fromLocation:'Toronto',toLocation:'Sacramento',milesFromHwy:1};
	window.places=[];
	window.placesHTML=[];
	window.places_references=[];
	var last_SearchComplete=false;
  window.gpView = {}; //temp stub to be refactored later
	window.gmarkers=[];
	window.graphicsStore = {
    routePoly: {},  //polyline for returned google directions
    aheadPoly: {},  //polyline for the route not yet covered by user
    queryPoly: {},  //polyline for the subquery of the route results are returned for
		placeBoxes:[],
		placeMarkers:[],
    myMarker: {},  //marker to show current user location
    queryMarkers: [],  //markers to show start/end of query location
    routeMarkers: [],  //markers to mark start/end of the route
	};

  //window.googleMaps.initialize();

	function returnplaces(travel){
		alert(travel.fromLocation);
		var X=[];
		X.push({placeName:'the place',logitude:'112',latitude:'345',milesFromHwy:'10'});
		return X;

	}
		/* Initialize range slider
		$('#rangeSlider').noUiSlider({
			 range: [startPoint,endPoint]
			,start: [startPoint,endPoint]
			,serialization:{
				to: [$('#rangeUpper'),$('#rangeLower')]

			}
		});
	//Initialize milage slider
	$('#milesSlider').noUiSlider({
			 range: [milesLower,milesUpper]
			,start: [mileSet]
			,handles:1
			,serialization:{
				to: [$('#milesFromHwy')]

			}
		});
	*/

	function drawRoute(result){
    var routePoly = window.graphicsStore.routePoly;
    var aheadPoly = window.graphicsStore.aheadPoly;
    var queryPoly = window.graphicsStore.queryPoly;
    //delete old lines
    if(routePoly.setMap){
      routePoly.setMap(null);
    }
    if(aheadPoly.setMap){
      aheadPoly.setMap(null);
    }
    if(queryPoly.setMap){
      queryPoly.setMap(null);
    }

    routePoly = new google.maps.Polyline({
      strokeColor: '#22F',
      strokeOpacity: 0.5,
      strokeWeight: 6
    });
    aheadPoly = new google.maps.Polyline({
      strokeColor: '#F22',
      strokeOpacity: 0.5,
      strokeWeight: 6
    });
    queryPoly = new google.maps.Polyline({
      strokeColor: '#2F2',
      strokeOpacity: 0.7,
      strokeWeight: 10
    });
    //reassign graphicsStore polylines to new polyLines
    window.graphicsStore.routePoly = routePoly;
    window.graphicsStore.aheadPoly = aheadPoly;
    window.graphicsStore.queryPoly = queryPoly;

    routePoly.setMap(window.googleMaps.map);
    aheadPoly.setMap(window.googleMaps.map);
    queryPoly.setMap(window.googleMaps.map);

    queryPoly.setPath(result.queryPoints); //first to place it at bottom of draw stack
    routePoly.setPath(result.routes[0].overview_path);
    aheadPoly.setPath(result.aheadPoints);

    //make the new line clickable
    google.maps.event.addListener(routePoly, 'click', window.controller.mapClick);
    google.maps.event.addListener(aheadPoly, 'click', window.controller.mapClick);
    google.maps.event.addListener(queryPoly, 'click', window.controller.mapClick);
	}

	function drawPlaces(placesObject){
		//put places rendering code here
		//should render HTML into div id=results
		alert(placesObject);
	}

	function drawPlacesBoxes(boxes){
		//delete existing boxes
		var i;
		for(i = 0;i < window.graphicsStore.placeBoxes.length;i ++){
			window.graphicsStore.placeBoxes[i].setMap(null);
		}
		//draw new boxes
		window.graphicsStore.placeBoxes = [];
		for(i = 0;i < boxes.length; i++){
			window.graphicsStore.placeBoxes.push(new google.maps.Rectangle({
				bounds: boxes[i],
				fillOpacity: 0,
				strokeOpacity: 0.9,
				strokeColor: '#000',
				strokeWeight: 1,
				map: window.googleMaps.map
			}));
		}
	}

	function getPlacesLength(){
		return {places: places_references,  places_length: places_references.length}
	}

	function getPlacesDetails(index, value) {
		places.push(value);
		// console.log(index, value.place);
	}

	function getPlacesDetailsHTML(index, HTML) {
		placesHTML.push(HTML);
		$('.places').append(HTML);
	}

	function drawPlacesMarkers(results){
		var service = window.googleMaps.placesService;
			 function createMarker(place){
			    var placeLoc=place.geometry.location;
			    var map = window.googleMaps.map;
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
			        animation: google.maps.Animation.DROP,
			        position:place.geometry.location
			    });
			    var request =  {
			          reference: place.reference
			    };
			    google.maps.event.addListener(marker,'click',function(){
			        service.getDetails(request, function(place, status) {
			        if (status == google.maps.places.PlacesServiceStatus.OK) {
			          var details={
			          	name: place.name,
			          	address: place.formatted_address,
			          	phone_num: place.formatted_phone_number,
			          	website: place.website,
			          	types: place.types
			          };
			          //handlebars template
			          var source = $('#popup-template').html();
			          var template = Handlebars.compile(source);
			          var html = template(details);
			          //template end
			          window.googleMaps.infoWindow.setContent(html);
			          window.googleMaps.infoWindow.open(map,marker);
			        } else {
			          var contentStr = "<h5>No Result, status="+status+"</h5>";
			          window.googleMaps.infoWindow.setContent(contentStr);
			          window.googleMaps.infoWindow.open(map,marker);
			        }
			        window.places_gen.generateDirections(place);
			        window.places_gen.displayDirections(place);
			      });
			    });

			    gmarkers.push(marker);
			    var side_bar_html = "<a href='javascript:google.maps.event.trigger(gmarkers["+parseInt(gmarkers.length-1)+"],\"click\");'>"+place.name+"</a><br>";
			  }

		    if (results[0] !== null){
		      for (var i = 0, result; result = results[i]; i++) {
		          var marker = createMarker(result);
		          places_references.push(result.reference); // marker?
		      }
		    }
	}

	////This will stop the details for each seach hit from being appended to
	////output array
	function clearDetailsTimer() {
		$(document).trigger('stop');
	}
	////This stops the radarSearch for each of the bouding boxes
	function clearASYNC() {
		$(document).trigger('stopASYNC');
	}


	$('#btnGetRoute').click(function(){
		// clearDetailsTimer();
		clearASYNC();
		routeRequestObject.start = $('#fromInput').val();
		routeRequestObject.end = $('#toInput').val();
		routeRequestObject.width = $('#milesFromHwy').val() * 1.60934;	//width is sent in km
		routeRequestObject.drawRoute = drawRoute;

		window.controller.getRoute(routeRequestObject);
	});

	$('#btnGetPlaces').click(function(){
		var placesRequestObject = {};
		placesRequestObject.services = 'donuts';
		placesRequestObject.width = ($('#milesFromHwy').val() * 1.60934) / 2;	//width is sent in km & fudge factor
		placesRequestObject.drawPlaces = drawPlaces;
		if($('#placesDrawBoxes').is(':checked')){
			placesRequestObject.drawBoxes = drawPlacesBoxes;
		}
		placesRequestObject.drawMarkers = drawPlacesMarkers;
		placesRequestObject.getLength = getPlacesLength;
		placesRequestObject.getDetails = getPlacesDetails;
		placesRequestObject.getDetailsHTML = getPlacesDetailsHTML;

		window.controller.getPlaces(placesRequestObject);
		//$('.places').hide();
	});

  $('#fakeGeo').click(function(){
    //sets mode flag so next click sets the (fake) user location
    window.controller.mode.gettingFakeGeo = true;
  });

  window.gpView.showUserLocation = function(latLng){
    //remove previous marker, if any
    if(window.graphicsStore.myMarker.setMap){
      window.graphicsStore.myMarker.setMap(null);
    }
    if(window.controller.mode.hasLocation){
      window.graphicsStore.myMarker = new google.maps.Marker({
        position: latLng,
        map: window.googleMaps.map,
        title:'You are Here!'
      });
    }
  };

	$('#shutterToggle').click(function(){
		$('#shutter').toggle();
	});


	//From Auto Complete##############################################

	function fromInitialize() {
  var map = window.googleMaps.map;
  var fromInput = /** @type {HTMLInputElement} */(
      document.getElementById('fromInput'));


  var fromTypes = document.getElementById('fromType-selector');

//Map Stuff ---Move inputs to map
  //map.controls[google.maps.ControlPosition.TOP_LEFT].push(fromInput);
  //map.controls[google.maps.ControlPosition.TOP_LEFT].push(fromTypes);



  var fromComplete = new google.maps.places.Autocomplete(fromInput);
//Map Stuff
  fromComplete.bindTo('bounds', map);
  var fromInfowindow = new google.maps.InfoWindow();
  var fromMarker = new google.maps.Marker({
    map: map
  });

  google.maps.event.addListener(map, 'click', window.controller.mapClick);

  google.maps.event.addListener(fromComplete, 'fromPlace_changed', function() {

    //Map Stuff
    fromInfowindow.close();
    fromMarker.setVisible(false);


    var fromPlace = fromComplete.getPlace();
    if (!fromPlace.geometry) {
      return;
    }

    //Map Stuff
    // If the place has a geometry, then present it on a map.
    if (fromPlace.geometry.viewport) {
      map.fitBounds(fromPlace.geometry.viewport);
    } else {
      map.setCenter(fromPlace.geometry.location);
      map.setZoom(17);  // 17 looks good
    }
    fromMarker.setIcon(/** @type {google.maps.Icon} */({
      url: fromPlace.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
    }));
    fromMarker.setPosition(place.geometry.location);
    fromMarker.setVisible(true);



    var fromAddress = '';
    if (fromPlace.fromAddress_components) {
      fromAddress = [
        (fromPlace.fromAddress_components[0] && fromPlace.fromAddress_components[0].short_name || ''),
        (fromPlace.fromAddress_components[1] && fromPlace.fromAddress_components[1].short_name || ''),
        (fromPlace.fromAddress_components[2] && fromPlace.fromAddress_components[2].short_name || '')
      ].join(' ');
    }
      //Map Stuff
      fromInfowindow.setContent('<div><strong>' + fromPlace.name + '</strong><br>' + fromAddress);
      fromInfowindow.open(map, fromMarker);

  });


  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  function fromSetupClickListener(id, types) {
    var fromRadioButton = document.getElementById(id);
    google.maps.event.addDomListener(fromRadioButton, 'click', function() {
      fromComplete.setTypes(types);
    });
  }

  fromSetupClickListener('fromChangetype-all', []);
  fromSetupClickListener('fromChangetype-establishment', ['establishment']);
  fromSetupClickListener('fromChangetype-geocode', ['geocode']);
}

// to AutoComplete####################################################

function toInitialize() {
  var toInput = /** @type {HTMLInputElement} */(
      document.getElementById('toInput'));

  var toTypes = document.getElementById('type-selector');

  var toComplete = new google.maps.places.Autocomplete(toInput);

  google.maps.event.addListener(toComplete, 'place_changed', function() {

    var toPlace = toComplete.getPlace();
    if (!toPlace.geometry) {
      return;
    }

    var toAddress = '';
    if (toPlace.toAddress_components) {
      address = [
        (toPlace.toAddress_components[0] && toPlace.toAddress_components[0].short_name || ''),
        (toPlace.toAddress_components[1] && toPlace.toAddress_components[1].short_name || ''),
        (toPlace.toAddress_components[2] && toPlace.toAddress_components[2].short_name || '')
      ].join(' ');
    }

  });

  function toSetupClickListener(id, types) {
    var toRadioButton = document.getElementById(id);
    google.maps.event.addDomListener(toRadioButton, 'click', function() {
      toComplete.setTypes(types);
    });
  }

  toSetupClickListener('toChangetype-all', []);
  toSetupClickListener('toChangetype-establishment', ['establishment']);
  toSetupClickListener('toChangetype-geocode', ['geocode']);

}

//Combined to and from and Page initialazation
function initializePage(){
  window.googleMaps.initialize();
  fromInitialize();
  toInitialize();
}

//Intitialize
google.maps.event.addDomListener(window, 'load', initializePage);


});