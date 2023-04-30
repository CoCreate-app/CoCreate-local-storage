import observer from '@cocreate/observer';
import action from '@cocreate/actions'

const CoCreateLocalStorage = {
	support: true,
    storage: new Map(),

	init: function() {
		var elements = document.querySelectorAll('[localstorage-set], [localstorage-get]');
		this.initElements(elements)
        window.addEventListener('storage', function(e) {
            elements = document.querySelectorAll(`[localstorage-get="${e.key}"]`)
            for (let element of elements) {
                let value = this.getItem(key)
                if (value != null){
                    element.value = value;
                }
            }
		});
	},

	initElements: function(elements) {
		for (let element of elements)
			this.initElement(element)
	},

	initElement: function(element) {
        this.getItem(element)
        element.addEventListener('input', (e) => {
            let isRealtime = element.getAttribute('realtime')
			if (isRealtime == "false") return;

            let key = e.target.getAttribute('localstorage-set');
            this.setItem(key, e.target.value);

            let elements = document.querySelectorAll(`[localstorage-get="${key}"]`)
            for (let el of elements) {
                if (el != element) {
                    let value = this.getItem(key)
                    if (value != null){
                        el.value = value;
                    }
                }
        
            }
		})
    },
    
    getItem: function(key) {
        if (this.support)
            return window.localStorage.getItem(key)
        else
            return this.storage.get(key)
    }, 
    
    setItem: function(key, value) {
        if (this.support)
            window.localStorage.setItem(key, value);
        else
            this.storage.set(key, value)
    },

    removeItem: function(key) {
        if (this.support)
            window.localStorage.removeItem(key)
        else
            this.storage.delete(key)
    }, 
        
    runStorage: function(btn) {
        const form = btn.form;
        if (!form) return;
        
        let set_els = form.querySelectorAll('[localstorage-set]')
        for (let el of set_els) {
            let key = el.getAttribute('localstorage-set');
            if (el.value && key){
                this.setItem(key, el.value);
            }
        }
        let get_els = form.querySelectorAll('[localstorage-get]')
        for (let el of get_els) {
            let key = el.getAttribute('localstorage-get');
            if (!key) return;
            let value = this.getItem(key)
            if (value != null){
                el.value = value;
            }
        }
        let remove_els = form.querySelectorAll('[localstorage-remove]')
        for (let el of remove_els) {
            el.value = '';
            let key = el.getAttribute('localstorage-remove');
            if (key) {
                this.removeItem(key)
            }
        }
        
        document.dispatchEvent(new CustomEvent('localStorage', {
			detail: {}
		}))
       
    },

    checkSupport: function() {
        if (!('localStorage' in window)) {
            console.log("This browser doesn't support localStorage.");
            this.support = false;
        } else { 
            try {
                let test = window.localStorage.getItem('test')
                if (window.CoCreateConfig)
                    if (window.CoCreateConfig.localStorage === false)
                        this.support = false;
            } catch(e) {
                this.support = false;
            } finally {
                if (this.support)
                    this.init()
            }
        }
    }    
}

// observer.init({
// 	name: 'CoCreateLocalstorage',
// 	observe: ['addedNodes'],
// 	target: '[localstorage-key]',
// 	callback: function(mutation) {
// 		CoCreateLocalStorage._initSessionIds(mutation.target);
// 	}
// });

action.init({
	name: "localStorage",
	endEvent: "localStorage",
	callback: (btn, data) => {
		CoCreateLocalStorage.runStorage(btn)
	},
})

action.init({
	name: "localStorageRemove",
	endEvent: "localStorageRemoved",
	callback: (btn, data) => {
		CoCreateLocalStorage.runStorage(btn)
	},
})

CoCreateLocalStorage.checkSupport()

export default CoCreateLocalStorage;