import observer from '@cocreate/observer';
import action from '@cocreate/actions'

const CoCreateLocalStorage = {
    support: true,
    storage: new Map(),

    /**
    * Listen for storage events and update elements if needed. This is called on window. storage and when it's time to get / set data
    */
    init: function () {
        const self = this
        var elements = document.querySelectorAll('[localstorage-set], [localstorage-get]');
        this.initElements(elements)
        /**
        * @param e
        */
        window.addEventListener('storage', function (e) {
            elements = document.querySelectorAll(`[localstorage-get="${e.key}"]`)
            for (let element of elements) {
                let value = self.getItem(e.key)
                // Set the value of the element.
                if (value != null) {
                    element.setValue(value)
                }
            }
        });
    },

    /**
    * @param elements
    */
    initElements: function (elements) {
        for (let element of elements)
            this.initElement(element)
    },

    /**
    * @param element
    * 
    * @return { Object } The binding
    */
    initElement: function (element) {
        this.getItem(element)
        element.addEventListener('input', (e) => {
            let isRealtime = element.getAttribute('realtime')
            // Returns if realtime false.
            if (isRealtime == "false") return;

            let key = e.target.getAttribute('localstorage-set');
            // Set the key and value in the localstorage.
            if (key)
                this.setItem(key, e.target.value);

            let elements = document.querySelectorAll(`[localstorage-get="${key}"]`)
            for (let el of elements) {
                if (el != element) {
                    let value = this.getItem(key)
                    // Set the value of the element.
                    if (value != null) {
                        el.setValue(value)
                    }
                }

            }
        })
    },

    /**
    * @param key
    * 
    * @return { Mixed } The value associated with the key or undefined if not found. Note that this will be returned as a string if the key is an array
    */
    getItem: function (key) {
        // Returns the value of the key in the storage.
        if (this.support)
            return window.localStorage.getItem(key)
        else
            return this.storage.get(key)
    },

    /**
    * @param key - key name to store the value under
    * @param value - value to store
    */
    setItem: function (key, value) {
        // Set the value of the item.
        if (this.support)
            window.localStorage.setItem(key, value);
        else
            this.storage.set(key, value)
    },

    /**
    * @param key - The key name to delete from the storage
    */
    removeItem: function (key) {
        // Removes an item from the storage.
        if (this.support)
            window.localStorage.removeItem(key)
        else
            this.storage.delete(key)
    },

    /**
    * @param btn
    * 
    * @return { undefined } No return
    */
    runStorage: function (btn) {
        const form = btn.form;
        // If the form is not a form return false.
        if (!form) return;

        let set_els = form.querySelectorAll('[localstorage-set]')
        for (let el of set_els) {
            let key = el.getAttribute('localstorage-set');
            let value = el.getValue()
            // Sets the value of an item.
            if (value && key) {
                this.setItem(key, value);
            }
        }
        let get_els = form.querySelectorAll('[localstorage-get]')
        for (let el of get_els) {
            let key = el.getAttribute('localstorage-get');
            // If key is not set return false.
            if (!key) return;
            let value = this.getItem(key)
            // Set the value of the element.
            if (value != null) {
                el.setValue(value)
            }
        }
        let remove_els = form.querySelectorAll('[localstorage-remove]')
        for (let el of remove_els) {
            el.setValue('')
            let key = el.getAttribute('localstorage-remove');
            // Removes an item from the list.
            if (key) {
                this.removeItem(key)
            }
        }

        document.dispatchEvent(new CustomEvent('localStorage', {
            detail: {}
        }))

    },

    checkSupport: function () {
        // Check if the browser supports localStorage.
        if (!('localStorage' in window)) {
            console.log("This browser doesn't support localStorage.");
            this.support = false;
        } else {
            try {
                let test = window.localStorage.getItem('test')
                // If the CoCreateConfig. localStorage is false this method will set support to false.
                if (window.CoCreateConfig)
                    // If the server supports local storage
                    if (window.CoCreateConfig.localStorage === false)
                        this.support = false;
            } catch (e) {
                this.support = false;
            } finally {
                // Initialize the component. If support is enabled the method init is called.
                if (this.support)
                    this.init()
            }
        }
    }
}

action.init({
    name: "localStorage",
    endEvent: "localStorage",
    callback: (data) => {
        CoCreateLocalStorage.runStorage(data.element)
    },
})

action.init({
    name: "localStorageRemove",
    endEvent: "localStorageRemoved",
    callback: (data) => {
        CoCreateLocalStorage.runStorage(data.element)
    },
})

CoCreateLocalStorage.checkSupport()

export default CoCreateLocalStorage;