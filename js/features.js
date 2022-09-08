(function(){
	const $ = document.querySelectorAll.bind(document);
	const datetimeElem = $("#datetime")[0];
	const weatherElem  = $("#weather")[0];

	if (datetimeElem) {
		const updateTime = function(){
			datetimeElem.innerHTML = (new Date()).toLocaleString();
		};
		setInterval(updateTime, 500);
		updateTime();
	}

	if (weatherElem) {
		const storage = new Storage();
		const request = new SimpleRequest();

		const LOCATION_KEY = '[ftLocation]';
		const WEATHER_KEY  = '[ftWeather]';
		const SETTINGS_KEY = '[ftSettings]';

		const locationExpires = 24*3600*1000;
		const weatherExpires  = 24*3600*1000;

		const geoURL = 'https://freegeoip.app/json/';
		const weatherURLTemplate = 
			'https://api.openweathermap.org/data/2.5/weather?lat={LAT}&lon={LON}&appid=e0294aecfed3ca634a1a236d440e342a';
		const weatherIconTemplate = 'https://openweathermap.org/img/w/{ICON}.png';

		const currentTime = (new Date()).getTime();

		const getLocation = function(callback, forceUpdate) {
			if (!forceUpdate) {
				storage.get(LOCATION_KEY, function(data) {
					if (!data || data.savedAt + locationExpires < currentTime)
						return getLocation(callback, true);
					if (callback) callback(data);
				});
			} else {
				request.get(geoURL, function(resp) {
					try {
						resp = JSON.parse(resp);
						const lat = resp.latitude;
						const lon = resp.longitude;
						const city = resp.city;
						if (!lat || !lon || !city)
							throw new Error('Invalid result from geo service');
						const data = {
							lat: lat,
							lon: lon,
							city: city,
							savedAt: currentTime
						};
						storage.set(LOCATION_KEY, data);
						if (callback) callback(data);
					} catch (e) {
						console.error(e);
						if (callback) callback(false);
					}
				});
			}
		};

		const getWeather = function(geoData, callback, forceUpdate) {
			if (!forceUpdate) {
				storage.get(WEATHER_KEY, function(data) {
					if (!data || data.savedAt + weatherExpires < currentTime)
						return getWeather(geoData, callback, true);
					if (callback) callback(data);
				});
			} else {
				if (!geoData || !geoData.lat || !geoData.lon) {
					console.error(new Error('Invalid geoData provided'));
					if (callback) callback(false);
					return;
				}
				const weatherURL = weatherURLTemplate
					.replace('{LAT}', encodeURIComponent(geoData.lat))
					.replace('{LON}', encodeURIComponent(geoData.lon));
				request.get(weatherURL, function(resp) {
					//return console.log(resp);
					try {
						resp = JSON.parse(resp);
						const temp = resp.main.temp;
						const icon = resp.weather[0].icon;
						if (!temp || !icon)
							throw new Error('Invalid result from weather service');
						const data = {
							temp: temp,
							icon: icon,
							savedAt: currentTime
						};
						storage.set(WEATHER_KEY, data);
						if (callback) callback(data);
					} catch (e) {
						console.error(e);
						if (callback) callback(false);
					}
				});
			}
		};

		const getTempUnits = function(callback) {
			storage.get(SETTINGS_KEY, function(data) {
				let units = 'C';
				if (data && data.tempUnits)
					units = data.tempUnits;
				if (callback) callback(units);
			});
		};
		const setTempUnits = function(units) {
			storage.set(SETTINGS_KEY, {tempUnits: units});
		};
		const convertTempUnits = function(tempValue, units) {
			switch (units) {
				case 'C': return (tempValue - 273.15).toFixed(1);
				case 'F': return ((tempValue * 9 / 5) - 459.67).toFixed(0);
				default:  return tempValue;
			}
		};
		const switchTempUnits = function(units) {
			return (units == 'C') ? 'F' : 'C';
		};

		const showWeather = function(geoData, weatherData, tempUnits) {
			let html = '' + ((geoData && geoData.city) || '');
			if (weatherData && weatherData.temp) {
				if (html) 
					html += ': ';
				if (weatherData.temp) 
					html += convertTempUnits(weatherData.temp, tempUnits) + ' °' + tempUnits;
				if (weatherData.icon)
					html += '<img src="' + 
							weatherIconTemplate.replace('{ICON}', weatherData.icon) + 
						'" onerror="this.style.display=\'none\'">';
			}
			weatherElem.innerHTML = html;
		};

		getLocation(function(geoData) {
			console.log(geoData);
			getWeather(geoData, function(weatherData) {
				console.log(weatherData);
				getTempUnits(function(units) {
					showWeather(geoData, weatherData, units);

					weatherElem.addEventListener('click', function() {
						units = switchTempUnits(units);
						setTempUnits(units);
						showWeather(geoData, weatherData, units);
					});
				});
			});
		});
	}
})();