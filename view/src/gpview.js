$(function(){
	'use strict';

	var routeRequestObject = {fromLocation:'Toronto',toLocation:'Sacramento',milesFromHwy:1};
	window.places=[];
	var gmarkers=[];
	window.graphicsStore = {
		placeBoxes:[],
		placeMarkers:[]
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
		window.googleMaps.directionsRenderer.setDirections(result);
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
	          console.log(contentStr);
	          window.googleMaps.infoWindow.setContent(contentStr);
	          window.googleMaps.infoWindow.open(map,marker);
	        } else {
	          var contentStr = "<h5>No Result, status="+status+"</h5>";
	          window.googleMaps.infoWindow.setContent(contentStr);
	          window.googleMaps.infoWindow.open(map,marker);
	        }
	        // generateDirections(place);
	        // displayDirections(place);
	      });
	    });

    gmarkers.push(marker);
    var side_bar_html = "<a href='javascript:google.maps.event.trigger(gmarkers["+parseInt(gmarkers.length-1)+"],\"click\");'>"+place.name+"</a><br>";
  }

    if (results[0] !== null){
      for (var i = 0, result; result = results[i]; i++) {
          var marker = createMarker(result);
          places.push(result.reference); // marker?
      }
    }
	}

	$('#btnGetRoute').click(function(){
		routeRequestObject.start = $('#fromInput').val();
		routeRequestObject.end = $('#toInput').val();
		routeRequestObject.width = $('#milesFromHwy').val() * 1.60934;	//width is sent in km
		routeRequestObject.drawRoute = drawRoute;

		window.controller.getRoute(routeRequestObject);
	});

	$('#btnGetPlaces').click(function(){
		var placesRequestObject = {};
		placesRequestObject.services = 'thai';
		placesRequestObject.width = ($('#milesFromHwy').val() * 1.60934) / 2;	//width is sent in km & fudge factor
		placesRequestObject.drawPlaces = drawPlaces;
		if($('#placesDrawBoxes').is(':checked')){
			placesRequestObject.drawBoxes = drawPlacesBoxes;
		}
		placesRequestObject.drawMarkers = drawPlacesMarkers;

		window.controller.getPlaces(placesRequestObject);
	});

	$('#shutterToggle').click(function(){
		$('#shutter').toggle();
	});

});