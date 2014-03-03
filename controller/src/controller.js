(function(NS){
  // NS.Route = function(){
  //   var latLngArray;
  //   var latLngCallback = function(array){
  //     latLngArray = array;
  //   };

  //   var Constructor = function(){};
  //   Constructor.prototype.getPath = function(start, end, width){
  //     window.pathGen.calcRoute(
  //       function(array){
  //         latLngArray = array;
  //         console.log(latLngArray);
  //       }
  //       ,start, end, width);
  //     //console.log(latLngArray);
  //     return this;
  //   };

  //   Constructor.getPlaces = function(){

  //     return this;
  //   };

  //   return new Constructor();
  // };

  NS.getPlaces = function(start, end, width, searchTerm){
    var callback = function(array){
      console.log(searchTerm);
      window.places_gen.getPlaces(array, (width / 2));
    };
    window.pathGen.calcRoute(callback, start, end, width);
  };

})(window.controller = window.controller || {});