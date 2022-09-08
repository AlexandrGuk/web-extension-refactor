(function() {
	const form = document.getElementById("search-form");
	const input = document.getElementById("search-input");

	const loadData = function(id, url) {
	    const xhr = new XMLHttpRequest();
	    xhr.open('GET', url, true);
	    xhr.onload = function() {
	        try {
	            const resp = JSON.parse(xhr.responseText);
	            window[id](resp);
	        } catch (e) {};
	    };
	    xhr.send(null);
	};

	input.focus();
	document.body.addEventListener('click', function(){
		input.focus();
	});
	setTimeout(input.focus.bind(input), 100);

	const openURL = function(url, newTab) {
		if (newTab) {
			chrome.runtime.sendMessage({openURL: url});
		} else {
			location.href = url;
		}
	};

	const serializeForm = function() {
		var url = form.action;
		url += (form.action.indexOf('?') >= 0) ? '&' : '?';
		const inputs = form.getElementsByTagName('input');
		const params = [];
		for (var i = 0; i < inputs.length; i++) {
			params.push(encodeURIComponent(inputs[i].name) + '=' + encodeURIComponent(inputs[i].value));
		}
		url += params.join('&');
		return url;
	};

	const submitForm = function(newTab) {
		const url = serializeForm();
		const rawLocation = false;
		openURL(url, newTab);
	};

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		submitForm();
	});

	input.addEventListener('keydown', function(e){
		if (e && e.code) {
			if (e.code == 'Enter') {
				e.preventDefault();
				if (e.altKey || e.ctrlKey)
					return;
				submitForm(e.shiftKey);
			}
		}
	});
})();