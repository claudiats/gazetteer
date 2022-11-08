import { getCountryMap } from "./loadMap.js";
import { getWeather } from "./getInfo/getInfo.js";

//variables
var selectedCountry = "GB";


export const loading = new bootstrap.Modal($("#loading"),{keyboard: false});

// Event listeners
$(document).ready(loading.show());
$('#countries-dropdown').on('change', function(){
    loading.show();
    selectedCountry = (this.value);
    getCountryMap(selectedCountry);
});

$('#cities-dd').on('change', function(){
    let coordsArray = $('#cities-dd').val().split(",");
    getWeather(coordsArray);
});

//Setup
function populateCountries(){
    $.ajax({
        type: 'POST',
        url: 'libs/php/getCountriesList.php',
        dataType: 'json',
        success: function(data){
            let list = data.data.sort((a, b) => (a.name > b.name) ? 1 : -1);
            for (const el in list){
                $('<option>', {value: list[el]["code"], text: list[el]["name"]}).appendTo($('#countries-dropdown'));
            }
         },
         error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
         },
    })
}



const geoLocation = () => {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            (pos) => {
            useGeolocation(pos.coords);
            },
            useDefault,
        );
    } else {
        useDefault();
    }
}

function useGeolocation(pos){
    $.ajax({
        url:"libs/php/openCageGeocoding.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: pos.latitude,
            lng: pos.longitude,
        },
        success: (result) => {
            selectedCountry = result.data.results[0].components["ISO_3166-1_alpha-2"];
            $(`select[name^="countries-dd"] option[value=${selectedCountry}]`).attr("selected","selected");
            getCountryMap(selectedCountry);
        },
        error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            useDefault();
         },
    })
}

const useDefault = () => {
    $(`select[name^="countries-dd"] option[value=${selectedCountry}]`).attr("selected","selected");
    getCountryMap(selectedCountry);
}

// start program
populateCountries();
geoLocation();



