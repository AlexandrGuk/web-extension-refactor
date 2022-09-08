(function(){
	const WP_ROOT = 'https://incredibletab.com/wpcdn/';
	const DEFAULT_IMG_URL = 'default.jpg';

	const imgContainer = document.getElementById('background-image');
	let imagesInfo = null;
	const storage = new Storage();
	const request = new SimpleRequest();

	const INFO_KEY = '[wpInfo]';
	const CACHED_LIST_KEY = '[wpCached]';

	changeImage();
	document.getElementById('menu').addEventListener('click', changeImage);
	
	function checkWpInfo(callback) {
		let callbackCalled = false;
		const callWrap = function(data) {
			if (data) imagesInfo = data;
			if (callbackCalled) return;
			callbackCalled = true;
			callback();
		};
		if (imagesInfo)
			return callWrap();
		storage.get(INFO_KEY, function(data){
			if (data)
				return callWrap(data);
			request.get(WP_ROOT + 'wp.json', function(resp) {
				try {
					const info = JSON.parse(resp);
					if (info && info.length && info[0] && info[0].id) {
						let data = [];
						for (let i = 0; i < info.length; i++) {
							let id = info[i].id.toString().trim();
							storage.set(info[i].id, WP_ROOT + id + '.jpg');
							data.push(id);
						}
						storage.set(INFO_KEY, data);
						callWrap(data);
					}
				} catch (e) {}
			});
			setTimeout(callWrap, 1000);
		});
	}

	function cacheCurrentImage(id) {
		if (!id || imgContainer.src.substr(0, 4) != 'http')
			return;
		const imgData = serializeImage(imgContainer);
		storage.set(id, imgData);
		storage.get(CACHED_LIST_KEY, function(cachedList){
			if (!cachedList) cachedList = [];
			cachedList.push(id);
			storage.set(CACHED_LIST_KEY, cachedList);
		});
		console.log('image at ' + id + ' cached to storage');
	}

	function getRandomImage(info, callback) {
		const imgId = getRandomArrayElement(info);
		if (!imgId)
			callback(false);
		storage.get(imgId, function(url){
			if (!url) {
				callback(false);
			} else {
				callback(imgId, url);
			}
		});
	}
	function getRandomCachedImage(callback) {
		storage.get(CACHED_LIST_KEY, function(info){
			getRandomImage(info, callback);
		});
	}
	function getRandomOnlineImage(callback) {
		getRandomImage(imagesInfo, callback);
	}

	function setImage(url, callback) {
		reanimateNode(imgContainer, 'fade-in', 'fade-out');
		let callbackCalled = false;
		const callWrap = function(res) {
			if (callbackCalled) return;
			callbackCalled = true;
			callback(res);
		};
		imgContainer.onload = function() {
			alreadyLoaded = true;
			reanimateNode(imgContainer, 'fade-out', 'fade-in', true);
			callWrap(true);
		};
		imgContainer.onerror = function() {
			callWrap(false);
		};
		setTimeout(function(){
			callWrap(false);
		}, 3500);
		imgContainer.src = url;
	}

	function setDefaultImage() {
		setImage(DEFAULT_IMG_URL, function(){});
	}

	function chooseAndCacheImage(cached, callback) {
		const getImage = cached ? getRandomCachedImage : getRandomOnlineImage;
		getImage(function(imgId, url) {
			if (!imgId)
				return callback(false);
			setImage(url, function(isOk) {
				if (isOk) {
					if (!cached) cacheCurrentImage(imgId);
				}
				callback(isOk);
			});
		});
	}

	function changeImage() {
		checkWpInfo(function(){
			chooseAndCacheImage(false, function(isOk) {
				if (!isOk)
					chooseAndCacheImage(true, function(isOk){
						if (!isOk)
							setDefaultImage();
					});
			});
		});
	}

	function serializeImage(domNode) {
		const canvas = document.createElement('CANVAS');
		const ctx = canvas.getContext('2d');
		canvas.height = domNode.naturalHeight;
		canvas.width = domNode.naturalWidth;
		ctx.drawImage(domNode, 0, 0);
		return canvas.toDataURL('image/jpeg');
	}

	function reanimateNode(elem, from, to, force) {
		if (force || elem.classList.contains(from)) {
			elem.classList.remove(from);
			void elem.offsetWidth;
			elem.classList.add(to);
		}
	}

	function getRandomArrayElement(arr) {
		if (!arr || !arr.length)
			return false;
		const index = Math.floor(Math.random() * arr.length);
		const value = arr[index];
		return value;
	}
})();