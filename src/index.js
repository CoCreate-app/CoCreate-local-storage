
const CoCreateLocalStorage = {
	
	init: function() {
		var elements = document.querySelectorAll('[localstorage-set], [localstorage-get]');
		this.initElements(elements)
        window.addEventListener('storage', function(e) {
            elements = document.querySelectorAll(`[localstorage-get="${e.key}"]`)
            for (let element of elements)
                this.get(element)
		});
	},

	initElements: function(elements) {
		for (let element of elements)
			this.initElement(element)
	},

	initElement: function(element) {
        this.get(element)
        element.addEventListener('input', (e) => {
            let isRealtime = element.getAttribute('realtime')
			if (isRealtime == "false") return;
			this.set(e.target)
		})
    },
    
    get: function(element) {
        let key = element.getAttribute('localstorage-get');
        if (!key) return;
        let value = window.localStorage.getItem(key)
        if(value != null){
            element.value = value;
        }
    }, 
    
    set: function(element) {
        let key = element.getAttribute('localstorage-set');
        if(element.value && key){
            window.localStorage.setItem(key, element.value);
        }
    },
    
    remove: function(element) {
        element.value = '';
        let key = element.getAttribute('localstorage-remove');
        if (key) {
            window.localStorage.removeItem(key)
        }
    },
    
    runStorage: function(btn) {
        const form = btn.form;
        let storage = window.localStorage;
        if (!form) return;
        
        let set_els = form.querySelectorAll('[localstorage-set]')
        set_els.forEach(input=>{
            let key = input.getAttribute('localstorage-set');
            if(input.value && key){
                storage.setItem(key, input.value);
            }
        });
        let get_els = form.querySelectorAll('[localstorage-get]')
        get_els.forEach(input=>{
            let key = input.getAttribute('localstorage-get');
            if (!key) return;
            let value = storage.getItem(key)
            if(value != null){
                input.value = value;
            }
        });
        let remove_els = form.querySelectorAll('[localstorage-remove]')
        remove_els.forEach(input=>{
            input.value = '';
            let key = input.getAttribute('localstorage-remove');
            if (key) {
                storage.removeItem(key)
            }
        });
        
        document.dispatchEvent(new CustomEvent('localStorage', {
			detail: {}
		}))
       
    }
}

CoCreate.action.init({
	name: "localStorage",
	endEvent: "localStorage",
	callback: (btn, data) => {
		CoCreateLocalStorage.runStorage(btn)
	},
})

CoCreate.action.init({
	name: "localStorageRemove",
	endEvent: "localStorageRemoved",
	callback: (btn, data) => {
		CoCreateLocalStorage.runStorage(btn)
	},
})

export default CoCreateLocalStorage;