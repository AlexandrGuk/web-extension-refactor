function $(selector) {
	return document.querySelector(selector);
}

function $$(selector) {
	return [...document.querySelectorAll(selector)];
}

class LocalStorageWrapper {
	async get(id) {
		const obj = {}
		obj[id] = JSON.parse(localStorage[id] || null)
		return obj;
	}
	set(obj) {
		const [id, data] = Object.entries(obj)[0];
		if ( id && data ) {
			localStorage.setItem(String(id), JSON.stringify(data));
		}
	}
}

class Storage {
	constructor() {
		this.storage = chrome?.storage?.local || new LocalStorageWrapper()
	}
	async get(id) {
		const result = await this.storage.get(id);
		return result[id]
	}

	set(id, data) {
		this.storage.set({[id]: data})
	}
}

class SimpleRequest {
	get(url) {
		return fetch(url).then(r => r.ok ? r.json() : null).catch(_ => null);
	}

}
