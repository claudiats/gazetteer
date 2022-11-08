import getCountryInfo from "./getInfo/getInfo.js";




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

var lmap = L.map('map', {layers: [defaultTiles, topoTiles]});

var OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var overlayMaps = {
    "Railway": OpenRailwayMap
}

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(lmap);


var countryMarkers = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 35,
});
var countryLayer = L.geoJSON([], {style: {color: 'orange'}});
var countryGroup = L.featureGroup([countryMarkers, countryLayer]);
let citiesGroup;
var tempsGroup;

let modals = {
    'info': {
        icon: 'info',
    },
    'weather': {
        icon: 'cloud-sun',
    },
    'currency': {
        icon: 'coins',
    },
    'wikipedia': {
        icon: 'wikipedia-w fa-brands',
    },
    'holidays': {
        icon: 'calendar',
    }

}


function createModals(name){
     modals[name]["modal"] = new bootstrap.Modal($(`#${name}Modal`),{keyboard: false});
     modals[name]["btn"] = L.easyButton(`fa fa-${modals[name]["icon"]}`, function(btn){
          modals[name]["modal"].show();
      }).addTo(lmap);
      modals[name]["btn"].disable();
}


for(let prop in modals){
    createModals(prop);
 }

function getCountryMap(selectedCountry){
    countryGroup.eachLayer(function(l) {l.clearLayers()});
    $.ajax({
        type: 'POST',
        url: 'libs/php/getCountryBorders.php',
        dataType: 'json',
        data: {
            country: selectedCountry
        },
        success: function(response){
            countryLayer.addData(response.data).addTo(lmap);
            let bounds = countryLayer.getBounds();
            lmap.fitBounds(bounds);
            console.log(citiesGroup);
            console.log(layerControl);   
    
            getCountryInfo(selectedCountry, bounds, countryMarkers);
         },
         error: function (jqXHR, textStatus, errorThrown){
            console.log(textStatus, errorThrown);
            loading.hide();
            alert('Error - country map not loaded');
         },
    });
}

export {lmap, modals, countryMarkers, layerControl, getCountryMap};