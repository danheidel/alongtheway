(function(NS){
  'use strict';
  NS.distDelta = function(meters){

  };

  NS.timeDelta = function(seconds){

  };

  NS.pointToPath = function(latLng, latLngArray){
    return _.min(latLngArray, function(point){
      return google.maps.geometry.spherical.computeDistanceBetween(latLng, point);
    });
  };

  NS.PointToPoint = function(latLng1, latLng2, latLngArray){

  };

  NS.PointPlusDelta = function(latLng, deltaData, latLngArray){

  };

  NS.PointCenteredDelta = function(latLng, deltaData, latLngArray){

  };

})(window.query = window.query || {});