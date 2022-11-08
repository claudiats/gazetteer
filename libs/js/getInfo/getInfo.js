import { displayCountryInfo, 
    displayExchangeRate, 
    displayCities,
    displayWeather,
    displayForecast,
    displayWeatherObs,
    displayHolidays,
    displayWikipedia,
    displayError,
    } from "../displayInfo.js/displayInfo.js";


 function getCountryInfo(selectedCountry, bounds, countryMarkers){
    $.ajax({
        type: 'POST',
        url: 'libs/php/getCountryInfo.php',
        dataType: 'json',
        data: {
            country: selectedCountry
        },
        success: function(r){
            displayCountryInfo(r, countryMarkers);
            getTemperatures(bounds);
            //getExchangeRate(r.data.curr);
            getCities(r.data.capital, bounds, selectedCountry);
            getWikipediaArticles(bounds, selectedCountry);
            getWeather([r.data.capital.lat, r.data.capital.lng]);
            //getHolidays(selectedCountry);
        },
        error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            displayError('info');
            alert('Error - country information not loaded');
         },
         });
};

function getExchangeRate(target){
    $.ajax({
             type: 'POST',
             url: 'libs/php/getExchangeRate.php',
             dataType: 'json',
             data: {
                 target: target,
             },
             success: function(r){
                displayExchangeRate(r);
            },
            error: function (jqXHR, textStatus, errorThrown){
                console.log(textStatus, errorThrown);
                modals['currency']['btn'].disable();
             },
         });
}

function getCities(capital, bounds, selectedCountry){
    $('#cities-dd').empty();
    $.ajax({
         type: 'POST',
         url: 'libs/php/getCities.php',
         dataType: 'json',
         data: {
            north: bounds["_northEast"].lat,
            south: bounds["_southWest"].lat,
            east: bounds["_northEast"].lng,
            west: bounds["_southWest"].lng,
         },
         success: (result) => {
            console.log(result);
            displayCities(result.data, capital, selectedCountry);
        },
         error: function (jqXHR, textStatus, errorThrown){
            $('<option>', {value: `${capital.lat},${capital.lng}`, text: capital.name}).appendTo($('#cities-dd'));
            loading.hide();
            alert('Cities Overlay not loaded');
         }
     })
}

function getWeather(coordsArray){
    $('#weather-content').hide();
    $.ajax({
          type: 'POST',
          url: 'libs/php/getWeather.php',
          dataType: 'json',
          data: {
            lat: coordsArray[0],
            lon: coordsArray[1]
          },
          success: function(result){
            displayWeather(result.data);
            getForecast(coordsArray);
           },
           error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            modals["weather"]["btn"].disable();
         },
        })
};

function getForecast(coordsArray){
    $('#forecast').empty();
    $.ajax({
        type: 'POST',
        url: 'libs/php/getForecast.php',
        dataType: 'json',
        data: {
          lat: coordsArray[0],
          lon: coordsArray[1]
        },
        success: function(result){
          displayForecast(result.data.daily);
         },
         error: function (jqXHR, textStatus, errorThrown){
          $('<p>Error displaying forecast</p>').appendTo('#forecast');
       },
      })
}

function getTemperatures(bounds){
    $.ajax({
        type: 'POST',
        url: 'libs/php/getWeatherStations.php',
        dataType: 'json',
        data: {
           north: bounds["_northEast"].lat,
           south: bounds["_southWest"].lat,
           east: bounds["_northEast"].lng,
           west: bounds["_southWest"].lng,
        },
        success: function(result){
            displayWeatherObs(result.data);
         },
         error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            alert('Error - did not retrieve weather stations data');
         },
    })
}
function getWikipediaArticles(bounds, selectedCountry){
    $('#articles').empty();
    $.ajax({
         type: 'POST',
         url: 'libs/php/getWikipediaArticles.php',
         dataType: 'json',
         data: {
            north: bounds["_northEast"].lat,
            south: bounds["_southWest"].lat,
            east: bounds["_northEast"].lng,
            west: bounds["_southWest"].lng,
         },
        success: function(result){
            displayWikipedia(result.data, selectedCountry);
        },
        error: function (jqXHR, textStatus, errorThrown){
        console.log(textStatus, errorThrown);
        alert('Error - did not retrieve wikipedia articles');
        modals['wikipedia']['btn'].disable();
         },
     })
}


function getHolidays(selectedCountry){
    console.log(selectedCountry)
    $('#holidays').empty();
    let year = new Date().getFullYear() - 1;
    $.ajax({
             type: 'POST',
             url: 'libs/php/getHolidays.php',
            dataType: 'json',
             data: {
                 country: selectedCountry,
                 year: year,
             },
            success: function(result){
                displayHolidays(result.data);
            },
            error: function (jqXHR, textStatus, errorThrown){
                console.log(textStatus, errorThrown);
                displayError('holidays');
             },
         });
}



export default getCountryInfo;
