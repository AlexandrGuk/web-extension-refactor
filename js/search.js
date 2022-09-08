{
	const form = $("#search-form");
	const input = $("#search-input");

	input.focus();
	document.body.addEventListener('click', function(){
		input.focus();
	});
	setTimeout(input.focus.bind(input), 100);

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		submitForm();
	});
	input.addEventListener('keydown', function (e) {
		if ( e?.key === 'Enter') {
			e.preventDefault();
			submitForm(e.shiftKey);
		}
	});

	function openURL(url, newTab) {
		newTab ? chrome.runtime.sendMessage({openURL: url}) : location.assign(url);
	}

	function submitForm(newTab) {
		const url = serializeForm();
		openURL(url, newTab);
	}

	function serializeForm() {
		const formData = new FormData(form);
		let url = new URL(form.action);
		for ( const [key, value] of formData ) {
			url.searchParams.append(key, value);
		}
		return url.href;
	}
}
