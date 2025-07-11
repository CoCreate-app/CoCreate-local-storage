import Observer from "@cocreate/observer";
import Actions from "@cocreate/actions";

const CoCreateLocalStorage = {
	support: true,
	storage: new Map(),

	init: function () {
		const self = this;
		var elements = document.querySelectorAll(
			"[localstorage-set], [localstorage-get]"
		);
		this.initElements(elements);

		window.addEventListener("storage", function (e) {
			elements = document.querySelectorAll(
				`[localstorage-get="${e.key}"]`
			);
			for (let element of elements) {
				// TODO: return if localstorage-query, etc...
				// - Decide how best to handle, considering localstorage is also handled by event.
				if (
					element.hasAttribute("localstorage-attribute") ||
					element.hasAttribute("localstorage-value") ||
					element.hasAttribute("localstorage-key")
				)
					return;
				let value = self.getItem(e.key);
				if (value != null) {
					element.setValue(value);
				}
			}
		});
	},

	/**
	 * Initializes a collection of elements.
	 * @param {Array<Element>} elements - An array of elements to be initialized.
	 */
	initElements: function (elements) {
		for (let element of elements) this.initElement(element);
	},

	/**
	 * Initializes a single element.
	 * @param {Element} element - The element to initialize. This function expects an 'Element' type.
	 */
	initElement: function (element) {
		let value = this.getItem(element);
		if (value) element.setValue(value);
		else {
			let inputEvent = new CustomEvent("input", {
				bubbles: true
			});

			Object.defineProperty(inputEvent, "target", {
				writable: false,
				value: element
			});
			element.dispatchEvent(inputEvent);
		}
		element.addEventListener("input", (e) => {
			let isRealtime = element.getAttribute("realtime");
			// Returns if realtime false.
			if (!isRealtime && isRealtime === "false") return;

			let key = e.target.getAttribute("localstorage-set");
			// Set the key and value in the localstorage.
			if (key) this.setItem(key, e.target.value);

			let elements = document.querySelectorAll(
				`[localstorage-get="${key}"]`
			);
			for (let el of elements) {
				if (el != element) {
					let value = this.getItem(key);
					// Set the value of the element.
					if (value != null) {
						el.setValue(value);
					}
				}
			}
		});
	},

	/**
	 * @param key
	 *
	 * @return { Mixed } The value associated with the key or undefined if not found. Note that this will be returned as a string if the key is an array
	 */
	getItem: function (key) {
		// Returns the value of the key in the storage.
		if (this.support) return window.localStorage.getItem(key);
		else return this.storage.get(key);
	},

	/**
	 * @param key - key name to store the value under
	 * @param value - value to store
	 */
	setItem: function (key, value) {
		try {
			if (this.support) {
				const oldValue = localStorage.getItem(key);

				window.localStorage.setItem(key, value);

				const keys = [
					"organization_id",
					"user_id",
					"clientId",
					"session_id"
				];
				if (keys.includes(key)) {
					const updateEvent = new CustomEvent("updateAttributes", {
						detail: { key, newValue: value, oldValue }
					});
					window.dispatchEvent(updateEvent);
				}
			} else this.storage.set(key, value);
		} catch (error) {
			if (
				error instanceof DOMException &&
				(error.code === 22 ||
					error.code === 1014 ||
					error.name === "QuotaExceededError" ||
					error.name === "NS_ERROR_DOM_QUOTA_REACHED")
			) {
				// TODO: create a fallback method, perhaps setting in indexeddb if above a specific size
				console.log(
					"Local storage limit exceeded. Falling back to IndexedDB."
				);
			} else {
				console.error("Error setting item:", error);
			}
		}
	},

	/**
	 * @param key - The key name to delete from the storage
	 */
	removeItem: function (key) {
		// Removes an item from the storage.
		if (this.support) window.localStorage.removeItem(key);
		else this.storage.delete(key);
	},

	/**
	 * @param action
	 *
	 * @return { undefined } No return
	 */
	runStorage: async function (action) {
		const form = action.form;
		// If the form is not a form return false.
		if (!form) return;

		let set_els = form.querySelectorAll("[localstorage-set]");
		for (let el of set_els) {
			let key = el.getAttribute("localstorage-set");
			let value = await el.getValue();
			// Sets the value of an item.
			if (value && key) {
				this.setItem(key, value);
			}
		}
		let get_els = form.querySelectorAll("[localstorage-get]");
		for (let el of get_els) {
			let key = el.getAttribute("localstorage-get");
			// If key is not set return false.
			if (!key) return;
			let value = this.getItem(key);
			// Set the value of the element.
			if (value != null) {
				el.setValue(value);
			}
		}
		let remove_els = form.querySelectorAll("[localstorage-remove]");
		for (let el of remove_els) {
			el.setValue("");
			let key = el.getAttribute("localstorage-remove");
			// Removes an item from the list.
			if (key) {
				this.removeItem(key);
			}
		}

		action.element.dispatchEvent(
			new CustomEvent("localStorage", {
				detail: {}
			})
		);
	},

	checkSupport: function () {
		// Check if the browser supports localStorage.
		if (!("localStorage" in window)) {
			console.log("This browser doesn't support localStorage.");
			this.support = false;
		} else {
			try {
				let test = window.localStorage.getItem("test");
				// If the CoCreateConfig. localStorage is false this method will set support to false.
				if (window.CoCreateConfig)
					if (window.CoCreateConfig.localStorage === false)
						// If the server supports local storage
						this.support = false;
			} catch (e) {
				this.support = false;
			} finally {
				// Initialize the component. If support is enabled the method init is called.
				if (this.support) this.init();
			}
		}
	}
};

Actions.init(
	{
		name: "localStorage",
		endEvent: "localStorage",
		callback: (data) => {
			CoCreateLocalStorage.runStorage(data);
		}
	},
	{
		name: "localStorageRemove",
		endEvent: "localStorageRemoved",
		callback: (data) => {
			CoCreateLocalStorage.runStorage(data);
		}
	}
);

Observer.init({
	types: ["addedNodes"],
	selector: "[localstorage-set]",
	callback: async function (mutation) {
		let key = mutation.target.getAttribute("localstorage-set");
		let value = await mutation.target.getValue();
		if (key && value) localStorage.setItem(key, value);
	}
});

CoCreateLocalStorage.checkSupport();

export default CoCreateLocalStorage;
