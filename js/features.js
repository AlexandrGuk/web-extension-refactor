{
	//--------------------------------------Constants---------------------------------------------------//
    const storage = new Storage();
    const request = new SimpleRequest();
    const LOCATION_KEY = '[ftLocation]';
    const WEATHER_KEY = '[ftWeather]';
    const SETTINGS_KEY = '[ftSettings]';
    const locationExpires = 24 * 3600 * 1000;
    const weatherExpires = 24 * 3600 * 1000;
    const geoURL = 'https://api.ipbase.com/v2/info?apikey=95G8vjeUbhem3fh0IzsUsXdOnjk498BHzZHW8qaA';
    const weatherURLTemplate =
        'https://api.openweathermap.org/data/2.5/weather?lat={LAT}&lon={LON}&appid=0765b9f565c1557805d6fe3eb8575237';
	const weatherIconTemplate = 'https://openweathermap.org/img/w/{ICON}.png';
	const weatherElem = $("#weather");
	//--------------------------------------Run---------------------------------------------------//
    updateTime();
    updateWeather()
	//--------------------------------------Function Declarations----------------------------------------//
    function updateTime() {
		const datetimeElem = $("#datetime");
        if ( datetimeElem ) {
            datetimeElem.textContent = (new Date()).toLocaleString();
            setTimeout(updateTime, 500);
        }
    }

    async function updateWeather() {
		if ( weatherElem ) {
			const geoData = await getLocation();
			const weather = await getWeather(geoData);
			let tempUnits = await storage.get(SETTINGS_KEY).then(units => units ? units.tempUnits : 'C');
			const setTempUnits = (units) => {
				storage.set(SETTINGS_KEY, {tempUnits: units});
				tempUnits = units;
			};
			showWeather(geoData, weather, tempUnits);
			weatherElem.addEventListener('click', () => {
				const units = switchTempUnits(tempUnits);
				setTempUnits(units);
				showWeather(geoData, weather, units)
			})
		}
	}

	async function getLocation(forceUpdate) {
		return forceUpdate ? requestLocation() : getSavedLocation()
    }

    async function getSavedLocation() {
        const location = await storage.get(LOCATION_KEY);
        if ( !location || location.savedAt + locationExpires < Date.now() ) {
            return requestLocation();
        }
        return location;
    }

	async function requestLocation() {
        const response = await request.get(geoURL);
        const location = response?.data?.location;
        if ( !location ) {
            console.error('Invalid result from geo service', response);
            return null;
        }
        const {latitude, longitude, city} = location;
        if ( !latitude || !longitude || !city ) {
            console.error('Invalid result from geo service', {latitude, longitude, city});
            return null;
        }
        const data = {
            latitude,
            longitude,
            city,
            savedAt: Date.now()
        };
        storage.set(LOCATION_KEY, data);
        return data;
    }

	async function getWeather(geoData, forceUpdate) {
		return forceUpdate ? requestWeather(geoData) : getSavedWeather(geoData);
    }

	async function getSavedWeather(geoData) {
        const weather = await storage.get(WEATHER_KEY);
        if ( !weather || weather.savedAt + weatherExpires < Date.now() ) {
            return requestWeather(geoData);
        }
        return weather;
    }

	async function requestWeather(geoData) {
        if ( !geoData || !geoData.latitude || !geoData.longitude ) {
            console.error('Invalid geoData provided', {geoData});
            return null;
        }
        const weatherURL = weatherURLTemplate
            .replace('{LAT}', encodeURIComponent(geoData.latitude))
            .replace('{LON}', encodeURIComponent(geoData.longitude));
        const weatherResponse = await request.get(weatherURL);
        const temp = weatherResponse?.main?.temp;
        const icon = weatherResponse?.weather[0]?.icon;
        if ( !temp || !icon ) {
            console.error('Invalid result from weather service');
            return null;
        }
        const data = {
            temp,
            icon,
            savedAt: Date.now()
        };
        storage.set(WEATHER_KEY, data);
        return data;
    }

	function showWeather(geoData, weatherData, units) {
		const text = `${geoData.city.name} : ${convertTempUnits(weatherData.temp, units) + ' °' + units}`;
		const icon = document.createElement('img');
		icon.src = weatherIconTemplate.replace('{ICON}', weatherData.icon);
		weatherElem.textContent = text;
		weatherElem.append(icon);
		weatherElem.style.cursor = 'pointer';
	}

	function convertTempUnits(tempValue, units) {
		const unitsConverter = {
			'C': () => (tempValue - 273.15).toFixed(1),
			'F': () => ((tempValue * 9 / 5) - 459.67).toFixed(0),
		}
		return unitsConverter[units] ? unitsConverter[units]() : tempValue;
	}

	function switchTempUnits  (units) {
		return (units === 'C') ? 'F' : 'C';
	}
}
