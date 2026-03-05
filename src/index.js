import Observer from "@cocreate/observer";
import Actions from "@cocreate/actions";

let support = true;
const storage = new Map();

function init() {
    var elements = document.querySelectorAll(
        "[localstorage-set], [localstorage-get], [sessionstorage-set], [sessionstorage-get]"
    );
    initElements(elements);

    window.addEventListener("storage", function (e) {
        // Determine which storage type triggered the event
        const type = e.storageArea === window.sessionStorage ? "sessionstorage" : "localstorage";
        
        elements = document.querySelectorAll(
            `[${type}-get="${e.key}"]`
        );
        for (let element of elements) {
            // TODO: Decide how best to handle considering storage is also handled by event.
            if (
                element.hasAttribute(`${type}-attribute`) ||
                element.hasAttribute(`${type}-value`) ||
                element.hasAttribute(`${type}-key`)
            )
                return;
            let value = getItem(e.key, type);
            if (value != null) {
                element.setValue(value);
            }
        }
    });
}

/**
 * Initializes a collection of elements.
 * @param {Array<Element>} elements - An array of elements to be initialized.
 */
function initElements(elements) {
    for (let element of elements) initElement(element);
}

/**
 * Initializes a single element.
 * @param {Element} element - The element to initialize. This function expects an 'Element' type.
 */
function initElement(element) {
    const types = ["localstorage", "sessionstorage"];
    let hasValue = false;

    for (let type of types) {
        let key = element.getAttribute(`${type}-get`) || element.getAttribute(`${type}-set`);
        if (!key) continue;
        
        let value = getItem(key, type);
        if (value) {
            element.setValue(value);
            hasValue = true;
        }
    }
    
    if (!hasValue) {
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

        for (let type of types) {
            let currentKey = e.target.getAttribute(`${type}-set`);
            if (!currentKey) continue;
            
            // Set the key and value in the respective storage.
            setItem(currentKey, e.target.value, type);

            let elements = document.querySelectorAll(
                `[${type}-get="${currentKey}"]`
            );
            for (let el of elements) {
                if (el != element) {
                    let value = getItem(currentKey, type);
                    // Set the value of the element.
                    if (value != null) {
                        el.setValue(value);
                    }
                }
            }
        }
    });
}

/**
 * @param key
 * @param type - 'localstorage' or 'sessionstorage'
 * @return { Mixed } The value associated with the key or undefined if not found.
 */
function getItem(key, type = "localstorage") {
    if (support) {
        return type === "sessionstorage" ? window.sessionStorage.getItem(key) : window.localStorage.getItem(key);
    } else {
        return storage.get(`${type}-${key}`);
    }
}

/**
 * @param key - key name to store the value under
 * @param value - value to store
 * @param type - 'localstorage' or 'sessionstorage'
 */
function setItem(key, value, type = "localstorage") {
    try {
        if (support) {
            const storageObj = type === "sessionstorage" ? window.sessionStorage : window.localStorage;
            const oldValue = storageObj.getItem(key);

            storageObj.setItem(key, value);

            const keys = [
                "organization_id",
                "user_id",
                "clientId",
                "session_id"
            ];
            if (keys.includes(key)) {
                const updateEvent = new CustomEvent("updateAttributes", {
                    detail: { key, newValue: value, oldValue, type }
                });
                window.dispatchEvent(updateEvent);
            }
        } else {
            storage.set(`${type}-${key}`, value);
        }
    } catch (error) {
        if (
            error instanceof DOMException &&
            (error.code === 22 ||
                error.code === 1014 ||
                error.name === "QuotaExceededError" ||
                error.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ) {
            console.log(
                "Storage limit exceeded. Falling back to Map."
            );
        } else {
            console.error("Error setting item:", error);
        }
    }
}

/**
 * @param key - The key name to delete from the storage
 * @param type - 'localstorage' or 'sessionstorage'
 */
function removeItem(key, type = "localstorage") {
    if (support) {
        if (type === "sessionstorage") window.sessionStorage.removeItem(key);
        else window.localStorage.removeItem(key);
    } else {
        storage.delete(`${type}-${key}`);
    }
}

/**
 * @param action
 *
 * @return { undefined } No return
 */
async function runStorage(action) {
    const form = action.form;
    if (!form) return;

    const types = ["localstorage", "sessionstorage"];

    for (let type of types) {
        let set_els = form.querySelectorAll(`[${type}-set]`);
        for (let el of set_els) {
            let key = el.getAttribute(`${type}-set`);
            let value = await el.getValue();
            if (value && key) {
                setItem(key, value, type);
            }
        }
        
        let get_els = form.querySelectorAll(`[${type}-get]`);
        for (let el of get_els) {
            let key = el.getAttribute(`${type}-get`);
            if (!key) continue; 
            let value = getItem(key, type);
            if (value != null) {
                el.setValue(value);
            }
        }
        
        let remove_els = form.querySelectorAll(`[${type}-remove]`);
        for (let el of remove_els) {
            el.setValue("");
            let key = el.getAttribute(`${type}-remove`);
            if (key) {
                removeItem(key, type);
            }
        }
    }

    action.element.dispatchEvent(
        new CustomEvent("localStorage", {
            detail: {}
        })
    );
}

const localStorage = {
    getItem: (key) => getItem(key, "localstorage"),
    setItem: (key, value) => setItem(key, value, "localstorage"),
    removeItem: (key) => removeItem(key, "localstorage")
};

const sessionStorage = {
    getItem: (key) => getItem(key, "sessionstorage"),
    setItem: (key, value) => setItem(key, value, "sessionstorage"),
    removeItem: (key) => removeItem(key, "sessionstorage")
};

function checkSupport() {
    // Check if the browser supports Web Storage.
    if (!("localStorage" in window) || !("sessionStorage" in window)) {
        console.log("This browser doesn't support Web Storage.");
        support = false;
    } else {
        try {
            window.localStorage.getItem("test");
            window.sessionStorage.getItem("test");
            if (window.CoCreateConfig && window.CoCreateConfig.localStorage === false)
                support = false;
        } catch (e) {
            support = false;
        } finally {
            if (support) init();
        }
    }
}

Actions.init(
    {
        name: "localStorage",
        endEvent: "localStorage",
        callback: (data) => {
            runStorage(data);
        }
    },
    {
        name: "localStorageRemove",
        endEvent: "localStorageRemoved",
        callback: (data) => {
            runStorage(data);
        }
    },
    {
        name: "sessionStorage",
        endEvent: "sessionStorage",
        callback: (data) => {
            runStorage(data);
        }
    },
    {
        name: "sessionStorageRemove",
        endEvent: "sessionStorageRemoved",
        callback: (data) => {
            runStorage(data);
        }
    }
);

Observer.init({
    types: ["addedNodes"],
    selector: "[localstorage-set], [sessionstorage-set]",
    callback: async function (mutation) {
        const types = ["localstorage", "sessionstorage"];
        for (let type of types) {
            let key = mutation.target.getAttribute(`${type}-set`);
            if (key) {
                let value = await mutation.target.getValue();
                if (value) setItem(key, value, type);
            }
        }
    }
});

checkSupport();


export default {
    init,
    initElements,
    initElement,
    getItem,
    setItem,
    removeItem,
    runStorage,
    checkSupport,
    localStorage,
    sessionStorage
};