//event listeners
$(document).ready($('#loading').show());


//variables
var selectedCountry = "GB";
var bounds;
var exchangeRate;


const modals = {
    'info': 'Country Information',
    'cloud-sun': 'Weather',
    'coins': 'Currency',
};

//setup map

var defaultTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});
var topoTiles = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var baseMaps = {
    "Topography": topoTiles,
    "Default": defaultTiles
};

var countryMarkers = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 35,
});
var countryLayer = L.geoJSON();
var countryGroup = L.featureGroup([countryMarkers, countryLayer]);
var exchangeRate;
var citiesGroup;
var tempsGroup;

var map = L.map('map', {layers: [defaultTiles, topoTiles]});

var OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var overlayMaps = {
    "Railway": OpenRailwayMap
}

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);


//== Custom buttons
const createModalButton = (name, tooltip) => {
    let modal = $(`#${name}-modal`);
    L.easyButton(`fa-${name}`, function(btn){
        modal.show();
        $(`#close-${name}`).on('click', function(){
            modal.hide();
        });
        window.onclick = function(event) {
            if (event.target == modal[0]) {
                console.log('con', event.target);
                modal.hide();
            }
        }
    },
    tooltip).addTo(map);
    
}

// Event listeners
$('#countries-dropdown').on('change', function(){
    $('#loading').show();
    selectedCountry = (this.value);
    getCountryMap();
    layerControl.removeLayer(citiesGroup);
    layerControl.removeLayer(tempsGroup);
});

$('#cities-dd').on('change', function(){
    let coordsArray = $('#cities-dd').val().split(",");
    getWeather(coordsArray);
});
for(let prop in modals){
    createModalButton(prop, modals[prop]);
}


function populateCountries(){
    $.ajax({
        type: 'POST',
        url: 'libs/php/getCountriesList.php',
        dataType: 'json',
        success: function(data){
            let list = data.data.sort((a, b) => (a.name > b.name) ? 1 : -1);
            for (let el in list){
                $('<option>', {value: list[el]["code"], text: list[el]["name"]}).appendTo($('#countries-dropdown'));
          }
         },
         error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
         },
    })
}

function getCountryMap(){
    countryGroup.eachLayer(function(l) {l.clearLayers()});
    $.ajax({
        type: 'POST',
        url: 'libs/php/getCountryBorders.php',
        dataType: 'json',
        data: {
            country: selectedCountry
        },
        success: function(response){
            countryLayer.addData(response.data).addTo(map);
            bounds = countryLayer.getBounds();
            map.fitBounds(bounds);
            getInfo();
            // getWikipediaArticles();
            getTemperatures();
         },
         error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            alert('Error - country map not loaded');
         },
    });
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
    };
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
            $(`#countries-dropdown option[value=${selectedCountry}]`).attr("selected", "selected");
            getCountryMap();
        },
        error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            useDefault();
         },
    })
}

function getInfo(){
    $.ajax({
        type: 'POST',
        url: 'libs/php/getCountryInfo.php',
        dataType: 'json',
        data: {
            country: selectedCountry
        },
        success: function(r){
            console.log(r.data);
            $('#area').html(r.data.area);
            $('#name').html(r.data.name);
            $('#flag').attr("src", r.data.flag);
            $('#capital').html(r.data.capital.name);
            $('#pop').html(r.data.pop);
            $('#currency').html(r.data.currname);
            $('#local-currency').html(r.data.currsym + " ( " + r.data.curr + " ) ");
            //getExchangeRate(r.data.curr);
            getCities(r.data.capital);
            getWeather([r.data.capital.lat, r.data.capital.lng]);
            countryMarkers.addTo(map);
            $('#loading').hide();
        },
        error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            $('#loading').hide();
            alert('Error - country information not loaded');
         },
         });
};

function getCities(capital){
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
         success: (result) => {processCities(result.data)},
         error: function (jqXHR, textStatus, errorThrown){
            $('<option>', {value: `${capital.lat},${capital.lng}`, text: capital.name}).appendTo($('#cities-dd'));
            alert('Cities not loaded');
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
            let icon = 'fa fa-' + weatherIcon[result.data.weather[0].icon]; 
            $('#current-temp').html(result.data.main.temp);
            $('#max').html(result.data.main.temp_max);
            $('#min').html(result.data.main.temp_min);
            $('#humidity').html(result.data.main.humidity);
            $('#wind').html(result.data.wind.speed);
            $('#description').html(result.data.weather[0].description);
            $('#weather-icon').attr("class", icon);
            $('#weather-content').show();
           },
           error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            alert('Error - did not retrieve weather data');
         },
        })
};

function getWikipediaArticles(){
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
            console.log(result);
            let wikiMarker = {
                 iconShape: "marker",
                 icon: 'link',
                 borderWidth: 0,
                 textColor: "white",
                 backgroundColor: "blue",
            };
            var wikipediaMarkers = [];
            result.data.filter(a => a.countryCode == selectedCountry)
            .map(el => {
                let summary = el.summary.slice(0,200) + el.summary.slice(200,210).split(" ")[0] + "... ";
                let img = "";
                if(el.thumbnailImg){
                    img = `<img src="${el.thumbnailImg}" />`;
                }
                let popUpString = `<h4>${el.title}</h4> ${img}
                <p>${summary} <a href="https://${el.wikipediaUrl} target="_blank">See more</a></p>`;
                let marker = L.marker([el.lat, el.lng], {
                     icon: L.BeautifyIcon.icon(wikiMarker)}).bindTooltip(`${el.title}`).openTooltip()
                 .bindPopup(popUpString).openPopup();
                wikipediaMarkers.push(marker);
            });
            wikipediaGroup = L.featureGroup.subGroup(countryMarkers, wikipediaMarkers);
            layerControl.addOverlay(wikipediaGroup, 'Wikipedia Articles').addTo(map);
          },
          error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            alert('Error - did not retrieve wikipedia articles');
         },
     })
}

function getTemperatures(){
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
            let options = {
                iconShape: 'circle-dot',
                iconSize: [10,10],
                borderWidth: 0,
            };
            let tempsMarkers = [];
            result.data.map((el) => {
                let color = pickColor(parseInt(el.temperature));
                options.backgroundColor =  color;
                let marker = L.marker([el.lat, el.lng], {
                    icon: L.BeautifyIcon.icon(options),
                }).bindTooltip(`${el.temperature} &#176`).openTooltip();
                tempsMarkers.push(marker);
            });
            tempsGroup = L.featureGroup.subGroup(countryMarkers, tempsMarkers).addTo(map);
            layerControl.addOverlay(tempsGroup, 'Temperatures');
         },
         error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            alert('Error - did not retrieve weather stations data');
            tempsButton.disable();
         },
    })
}

function getExchangeRate(target){
    $.ajax({
             type: 'POST',
             url: 'libs/php/getExchangeRate.php',
             dataType: 'json',
             data: {
                 target: target,
             },
             success: function(r){
            exchangeRate = r.data;
            $('#converted').html(exchangeRate.toFixed(4));
            $('#dollars').on("change", function(){
                $('#converted').html((this.value * exchangeRate).toFixed(4));
            })
            },
            error: function (jqXHR, textStatus, errorThrown){
                console.log(textStatus, errorThrown);
                alert('Error - could not retrieve currency exchange rates');
             },
         });
}

//Utils

let weatherIcon = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'cloud-sun',
    '02n': 'cloud-moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-showers-heavy',
    '09n': 'cloud-showers-heavy',
    '10d': 'cloud-sun-rain',
    '10n': 'cloud-moon-rain',
    '11d': 'cloud-bolt',
    '11n': 'cloud-bolt',
    '13d': 'snowflake',
    '13n': 'snowflake',
    '50d': 'smog',
    '50n': 'smog',
}
//scale from light blue to dark orange
var f = chroma.scale(['#000066','blue', 'orange', '#ff6600']).domain([-25, -10, 35, 45]).mode('hsl');
function pickColor(temp){
    return f(temp);
}

const useDefault = () => {
    $("#countries-dropdown option[value=GB]").attr("selected", "selected");
    getCountryMap();
}



const processCities = (cities) => {
    var citiesMarkers = [];
    let cityMarker = {
        icon: 'landmark-flag',
        textColor: 'white',
        borderColor: 'navy',
        backgroundColor: 'navy',
    }
    cities.filter(c => c.countrycode === selectedCountry)
    .map((c, index) => {
        $('<option>', {value: `${c.lat},${c.lng}`, text: c.name}).appendTo($('#cities-dd'));
        let marker = L.marker([c.lat, c.lng], {
            icon: L.BeautifyIcon.icon(cityMarker),
            opacity: 0.85})
            .bindPopup(`<strong>${c.name}</strong></br>
            <i class="fa fa-people-group"></i> ${c.population}<br>
            <a href="https://${c.wikipedia}" target="_blank"><i class="fa-brands fa-wikipedia-w"></i> Open Wikipedia Article</i></a>`).openPopup()
            .bindTooltip(`${c.name}`).openTooltip();
            citiesMarkers.push(marker);
            cityMarker["icon"] = "city";
        });
    citiesGroup = L.featureGroup.subGroup(countryMarkers, citiesMarkers).addTo(map);
    layerControl.addOverlay(citiesGroup, 'Cities').addTo(map);
}

// start program
populateCountries();
geoLocation();


