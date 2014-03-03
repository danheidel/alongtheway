$(function(){
	'use strict';

	var requestObject = {fromLocation:'Toronto',toLocation:'Sacramento',milesFromHwy:1};
	var places=[];

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
	$('#btnGetPlaces').click(function(){
		requestObject.fromLocation = $('#fromInput').val();
		requestObject.toLocation = $('#toInput').val();
		requestObject.milesFromHwy = $('#milesFromHwy').val();
		//places=returnplaces(requestObject);
		window.controller.getPlaces(requestObject.fromLocation, requestObject.toLocation, requestObject.milesFromHwy * 1.60934, 'test');
	});

});