{
	const RANDOM_IMAGE_URL = 'https://loremflickr.com/api/1/?token=2330.EdgVRUMJkIZdJdzcEdELVALChWonkiMJ&width=1920&height=1080&tag=background';
	const DEFAULT_IMG_URL = 'default.jpg';
	const changeImageButton = $('#menu');
	let REQUEST_IN_PROGRESS = false;

	const imgContainer = document.getElementById('background-image');
	let imagesInfo = null;

	changeImage();
	changeImageButton.addEventListener('click', changeImage);


	async function getRandomImage() {
		REQUEST_IN_PROGRESS = true
		const src = await fetch(RANDOM_IMAGE_URL).then(resp => resp.url);
		if ( src ) {
			return src;
		}

	}

	function getRandomOnlineImage() {
		return getRandomImage(imagesInfo);
	}

	function setImage(url) {
		reanimateNode(imgContainer, 'fade-in', 'fade-out');
		imgContainer.onload = ()=> {
			REQUEST_IN_PROGRESS = false;
			reanimateNode(imgContainer, 'fade-out', 'fade-in', true);
		};
		imgContainer.onerror = () => {
			REQUEST_IN_PROGRESS = false;
			setDefaultImage();
		};
		imgContainer.src = url;
	}

	function setDefaultImage() {
		setImage(DEFAULT_IMG_URL, function(){});
	}

	async function chooseImage() {
		const imageSrc = await getRandomOnlineImage();
		if (!imageSrc) {
			return false;
		}
		setImage(imageSrc)
		return true;
	}

	async function changeImage() {
		changeImageButton.style.pointerEvents = 'none';
		changeImageButton.style.opacity = '0.3';
		if ( REQUEST_IN_PROGRESS ) {
			return;
		}
		const isOk = await chooseImage(false);
		if ( !isOk ) {
			setDefaultImage();
		}
		changeImageButton.style.pointerEvents = 'initial';
		changeImageButton.style.opacity = '1';
	}

	function reanimateNode(elem, from, to, force) {
		if (force || elem.classList.contains(from)) {
			elem.classList.remove(from);
			void elem.offsetWidth;
			elem.classList.add(to);
		}
	}
}
