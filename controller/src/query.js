(function(NS){
  'use strict';
  /*global google*/
  /*global _*/

  NS.distDelta = function(meters){

  };

  NS.timeDelta = function(seconds){

  };

  NS.pointToPath = function(latLng, latLngArray){
    return _.min(latLngArray, function(point){
      return google.maps.geometry.spherical.computeDistanceBetween(latLng, point);
    });
  };

  NS.pointToPoint = function(latLng1, latLng2, latLngArray){
    var startPoint, endPoint;
    var returnArray = [];
    startPoint = NS.pointToPath(latLng1, latLngArray);
    endPoint = NS.pointToPath(latLng2, latLngArray);
    if(endPoint.pointDist < startPoint.pointDist){
      //make sure start and end are ordered
      var tempPoint = endPoint;
      endPoint = startPoint;
      startPoint = tempPoint;
    }
    _.each(latLngArray, function(elem, index){
      if(elem.pointDist > startPoint.pointDist && elem.pointDist < endPoint.pointDist){
        returnArray.push(elem);
      }
    });
    return returnArray;
  };

  NS.pointPlusDelta = function(latLng, deltaData, latLngArray){

  };

  NS.pointCenteredDelta = function(latLng, deltaData, latLngArray){

  };

})(window.query = window.query || {});