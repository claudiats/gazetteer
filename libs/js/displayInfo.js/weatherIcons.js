export const weatherIcon = {
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
export function useWeatherCode(code){
    if (code == 0) {
        return ['sun', 'clear sky'];
    }
    if (code < 4){
        return ['cloud-sun', 'partly cloudy']
    }
    if(code == 4){
        return ['cloud', 'overcast'];
    }
    if (code < 50){
        return ['smog', 'fog'];
    }
    if(code < 60){
        return ['cloud-rain', 'drizzle']
    }
    if (code > 90 ){
        return ['cloud-bolt', 'thunderstorm'];
    }
    if (code < 70){
        return ['cloud-rain', 'rain'];
    } 
    if (code < 80 || code > 82 ) return ['snow', 'snow'];
    return ['cloud-showers-heavy', 'rain showers'];
}