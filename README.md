Along-The-Way codefellows project app

- all ? variables are optional with (default) values

googleMaps.js - initializes and exposes the Google Maps API
  - googleMaps.initialize(?lat(47.624), ?lng(237.664), ?zoom(12), ?type(google.maps.MapTypeId.ROADMAP))
  - googleMaps.map - assumes map element id = 'map'
  - googleMaps.directionsService
  - googleMaps.directionsRenderer - assumes panel element id = 'directions-panel'
  - googleMaps.placesService
  - googleMaps.routeBoxer
  - googleMaps.infoWindow

pathgen.js - generates an array of LatLng data pulled from Google Maps Directions
  - pathGen.calcRoute(callback, start, end, ?pointDist(10000), ?mode(google.maps.TravelMode.DRIVING))
    - -callback - callback function that receives the LatLng array
    - -start - either LatLng coords or a place name that Google can parse
    - -end - either LatLng coords or a place name that Google can parse
    - -pointDist - the desired spacing between data points in meters
    - -mode - which map mode should be used to generated the directions path
