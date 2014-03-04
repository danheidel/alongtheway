$(function(){
	'use strict';

	var routeRequestObject = {fromLocation:'Toronto',toLocation:'Sacramento',milesFromHwy:1};
	var places=[];
	window.graphicsStore = {
		boxes:[],
		markers:[]
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
		alert(placesObject);
	}

	function drawBoxes(boxes){
		//delete existing boxes
		var i;
		for(i = 0;i < window.graphicsStore.boxes.length;i ++){
			window.graphicsStore.boxes[i].setMap(null);
		}
		//draw new boxes
		window.graphicsStore.boxes = [];
		for(i = 0;i < boxes.length; i++){
			window.graphicsStore.boxes.push(new google.maps.Rectangle({
				bounds: boxes[i],
				fillOpacity: 0,
				strokeOpacity: 0.9,
				strokeColor: '#000',
				strokeWeight: 1,
				map: window.googleMaps.map
			}));
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
			placesRequestObject.drawBoxes = drawBoxes;
		}

		window.controller.getPlaces(placesRequestObject);
	});

});