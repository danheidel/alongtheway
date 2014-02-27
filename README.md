Along-The-Way codefellows project app

- all ? variables are optional with (default) values

googlemaps.js - initializes and exposes the Google Maps API
  - googlemaps.initialize(?lat(47.624), ?lng(237.664), ?zoom(12), ?type(google.maps.MapTypeId.ROADMAP))
  - googlemaps.map - assumes map element id = 'map'
  - googlemaps.directionsDisplay - assumes panel element id = 'directions-panel'
  - googlemaps.directionsService
  - googlemaps.directionRenderer
  - googlemaps.placesService
  - googlemaps.routeBoxer
  - googlemaps.infoWindow

pathgen.js - generates an array of LatLng data pulled from Google Maps Directions
  - pathGen.initialize()
  - pathGen.calcRoute(latLngArray, start, end, ?pointDist(10000), ?mode(google.maps.TravelMode.DRIVING))
    - -latLngArray - array data structure that returns the path info (array of google.maps.LatLng objects)
    - -start - either LatLng coords or a place name that Google can parse
    - -end - either LatLng coords or a place name that Google can parse
    - -pointDist - the desired spacing between data points in meters
    - -mode - which map mode should be used to generated the directions path
