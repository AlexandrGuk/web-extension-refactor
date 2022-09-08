function Storage() {
	const cStorage = (window.chrome && chrome && chrome.storage && chrome.storage.local);
	this.get = function(id, callback) {
		if (cStorage) {
			cStorage.get(id, function(data) {
				callback(data && data[id]);
			});
		} else {
			var data = null;
			try {
				data = JSON.parse(localStorage[id]);
			} catch (e) {}
			callback(data);
		}
	};
	this.set = function(id, data) {
		if (cStorage) {
			const obj = {};
			obj[id] = data;
			cStorage.set(obj);
		} else {
			localStorage[id] = JSON.stringify(data);
		}
	}
}

function SimpleRequest() {
	this.get = function(url, callback) {
		callback = callback || function(){};
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function(){
			callback(xhr.responseText);
		};
		const onError = function(e){
			callback(false);
		};
		xhr.error = onError;
		xhr.abort = onError;
		xhr.send(null);
	};
}

