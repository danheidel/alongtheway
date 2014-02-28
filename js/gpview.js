$(function(){

//Route and endpoint/range variables
var startPoint = 10; var endPoint = 40;
//Milage set and range variables
var milesLower = 0; milesUpper = 20; var mileSet = 10;
//Destination variables
var fromLocationSet='Toronto'; var toLocationSet='Sacramento';
var requestObject = {fromLocation:'Toronto',toLocation:'Sacramento',milesFromHwy:1};

  // Initialize range slider
  $('#rangeSlider').noUiSlider({
    range: [startPoint,endPoint],
    start: [startPoint,endPoint],
    serialization:{
      to: [$('#rangeUpper'),$('#rangeLower')]
    }
  });
  //Initialize milage slider
  $('#milesSlider').noUiSlider({
    range: [milesLower,milesUpper],
    start: [mileSet],
    handles:1,
    serialization:{
      to: [$('#milesFromHwy')]
    }
  });

  $('#btnGetPlaces').click(function(){
    requestObject.fromLocationSet = $('#fromLocation').val();
    requestObject.toLocationSet = $('#toLocation').val();
    console.log(requestObject);

  });

//Data Bindings
      /*  function bindMilesFromHwy(document.getElementById('#MilesFromHwy'),requestObject){
          var bind = document.getElementById('#milesFromHwy').getAttribute('bind').split(':');
          var milesFromHwyAttr = bind[0].trim();
          var reqObjAttr = bind[1].trim();
          Object.observe(requestObject, function (change){
            document.getElementById('#milesFromHwy')[milesFromHwyAttr] = requestObject[reqObjAttr];
          });

        /*  new MutationObserver(updateObj).observe(document.getElementById('#milesFromHwy'),{
            attributes: true,
            childList: true,
            characterData: true
          });

          document.getElementById('#milesFromHwy').addEventListener('change',updateObj);
          function updateObj(){
            requestObject[reqObjAttr] = document.getElementByID('#milesFromHwy')[milesFromHwyAttr];
          }

          document.getElementByID('#milesFromHwy')[milesFromHwyAttr] = requestObject[reqObjAttr];

        }

        */

//$('#btnSetRangePoints').click(function(){
//  $(rslider).val([$('#brange').val(),$('#erange').val()]);
//});

/*$('#btnGetRangePoints').click(function(){
  startPoint = $(rslider).val()[0];
  endPoint = $(rslider).val()[1];
  alert(startPoint+','+endPoint);
});
*/


      });