import {lmap, modals, countryMarkers, layerControl } from "../loadMap.js";
import {weatherIcon, useWeatherCode } from "./weatherIcons.js";
import { loading } from "../script.js";

var citiesGroup;
var tempsGroup;

export const displayCountryInfo = (r, countryMarkers) => {
    $('#area').html(numeral(r.data.area).format('0,0'));
    $('#name').html(r.data.name);
    $('#flag').attr("src", r.data.flag);
    $('#capital').html(r.data.capital.name);
    $('#pop').html(numeral(r.data.pop).format('0.00 a'));
    $('#currency').html(r.data.currname);
    $('#local-currency').html(r.data.currsym + " ( " + r.data.curr + " ) ");
    countryMarkers.addTo(lmap);
    modals['info']['btn'].enable();
    if(layerControl._layers.length > 3){
        layerControl.removeLayer(citiesGroup);
        layerControl.removeLayer(tempsGroup);
    };
    loading.hide();
}

export const displayExchangeRate = (r) => {
    console.log(r.data);
    let exchangeRate = r.data;
    $('#converted').html(exchangeRate.toFixed(4));
    $('#dollars').on("change", function(){
        $('#converted').html((this.value * exchangeRate).toFixed(4));
    })
    modals['currency']['btn'].enable();
}

export const displayCities = (cities, capital, selectedCountry) => {
    var citiesMarkers = [];
    let cityOptions = {
        icon: 'fa-landmark-flag',
        markerColor: 'blue-dark',
        shape: 'square',
        prefix: 'fa'
    }
    
    let filteredCities = cities.filter(c => {
        return ((c.countrycode === selectedCountry) && (c.population > 25000))
    });
    if(filteredCities.length == 0){
        displayCapital(capital);
        return;
    }
    let cap = filteredCities.shift();
    let sortedCities = filteredCities.sort((a, b) => (a.name > b.name) ? 1 : -1);
    sortedCities.unshift(cap);
    //sorted so that first is capital then in alphabetical order
    sortedCities.map((c, i) => {
        $('<option>', {value: `${c.lat},${c.lng}`, text: c.name}).appendTo($('#cities-dd'));
        let marker = L.marker([c.lat, c.lng], {
            icon: L.ExtraMarkers.icon(cityOptions),
            opacity: 0.85})
            .bindPopup(`<strong>${c.name}</strong></br>
            <i class="fa fa-people-group"></i> ${numeral(c.population).format('0.000 a')}<br>
            <a href="https://${c.wikipedia}" target="_blank"><i class="fa-brands fa-wikipedia-w"></i> ${c.wikipedia}</i></a>`).openPopup()
            .bindTooltip(`${c.name}`).openTooltip();
            citiesMarkers.push(marker);
            cityOptions.icon = 'fa-city'
        });
    citiesGroup = L.featureGroup.subGroup(countryMarkers, citiesMarkers).addTo(lmap);
    layerControl.addOverlay(citiesGroup, 'Cities').addTo(lmap);
    console.log(layerControl);
    loading.hide();
}

export const displayWeather = (data) => {
    let icon = 'fa fa-' + weatherIcon[data.weather[0].icon]; 
    $('#current-temp').html(data.main.temp);
    $('#max').html(data.main.temp_max);
    $('#min').html(data.main.temp_min);
    $('#humidity').html(data.main.humidity);
    $('#wind').html(data.wind.speed);
    $('#description').html(data.weather[0].description);
    $('#weather-icon').attr("class", icon);
    $('#weather-content').show();
    modals["weather"]["btn"].enable();
}

export const displayForecast = (data) => {
    data.time.map((d, i) => {
        let w = useWeatherCode(data.weathercode[i]);
        let card = `<div class="card">
            <div class="card-header">${Date.parse(d).toString('ddd d MMM')}</div>
                <div class="card-body">
                <h4 class="card-title fs-4"><i class="fa fa-${w[0]}"></i></h4>
    <p class="card-text">${w[1]}</p>
    </div>
    <div class="card-footer d-flex justify-content-between">
    <span>H: ${data.temperature_2m_max[i]} &#176;</span>
    <span>L: </i>${data.temperature_2m_min[i]} &#176;</span>
    </div>
  </div>
</div>`;
        $(card).appendTo('#forecast');
    })
}

export const displayWeatherObs = (data) => {
    let options = {
        icon: 'fa-temperature-three-quarters',
        prefix: 'fa',
        markerColor: 'pink',
    };
    let tempsMarkers = [];
    data.map((el) => {
        let marker = L.marker([el.lat, el.lng], {
            icon: L.ExtraMarkers.icon(options),
        }).bindTooltip(`${el.stationName}<br>Temperature: ${el.temperature} &#176 <br>Humidity: ${el.humidity}%`).openTooltip();
        tempsMarkers.push(marker);
    });
    tempsGroup = L.featureGroup.subGroup(countryMarkers, tempsMarkers).addTo(lmap);
    layerControl.addOverlay(tempsGroup, 'Weather Observations');
}

export const displayHolidays = (data) => {
    data.map(h => {
        let date = Date.parse(h.date).toString("d MMM");
        let holidayHTML = `<tr>
            <td>${date}</td>
            <td>${h.name}</td>
        </tr>`;
        $(holidayHTML).appendTo($('#holidays'));
    })
    modals["holidays"]["btn"].enable();
}

export const displayWikipedia = (data, selectedCountry) => {
    let articles = data.filter(a => a.countryCode == selectedCountry);
    articles.map(a => {
        let summary = a.summary.slice(0,200) + a.summary.slice(200,210).split(" ")[0] + " (...)";
        let articleHTML = `
            <a href="https://${a.wikipediaUrl}" target="_blank">
            <li class="list-group-item d-flex justify-content-between align-items-start">\
                <div class="ms-2auto">
                    <div class="fw-bold">${a.title}</div>
                    <p class="fs-6">${summary}</p>
                </div>
            </li></a>`;
            $(articleHTML).appendTo('#articles');
        });
    if(articles.length == 0) {
        $('<div>No articles to display</d>').appendTo('#articles');
    }
    modals['wikipedia']['btn'].enable();
}

function displayCapital(capital){
    $('<option>', {value: `${capital.lat},${capital.lng}`, text: capital.name}).appendTo($('#cities-dd'));
    loading.hide();
    alert('Cities Overlay not loaded');
}

export const displayError = (what) => {
    modals[what]["btn"].disable();
    loading.hide();
}