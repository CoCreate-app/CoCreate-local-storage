// let btns_localStorageBtn = document.querySelectorAll('.localStorageBtn');
// let storage = window.localStorage;
// btns_localStorageBtn.forEach(btn=>{
    
//     btn.addEventListener("click",function(e){
//         e.preventDefault()
//         let forms = btn.form;
//         let elements_localstorage_set = forms.querySelectorAll('[data-localstorage_set]')
//         elements_localstorage_set.forEach(input=>{
//             if(input.value){
//                 storage.setItem(input.dataset['localstorage_set'], input.value);
//             }
//         });
//         let elements_localstorage_get = forms.querySelectorAll('[data-localstorage_get]')
//         elements_localstorage_get.forEach(input=>{
//             let value = storage.getItem(input.dataset['localstorage_get'])
//             if(value!=null){
//                 input.value = value;
//             }
//         });
//         let elements_localstorage_remove = forms.querySelectorAll('[data-localstorage_remove]')
//         elements_localstorage_remove.forEach(input=>{
//                 input.value = '';
//                 storage.removeItem(input.dataset['localstorage_remove'])
//         });
//     });
    
// });

const CoCreateLocalStorage = {

    runStorage: function(btn) {
        const form = btn.form;
        let storage = window.localStorage;
        if (!form) return;
        
        let set_els = form.querySelectorAll('[data-localstorage_set]')
        set_els.forEach(input=>{
            let key = input.getAttribute('data-localstorage_set');
            if(input.value && key){
                storage.setItem(key, input.value);
            }
        });
        let get_els = form.querySelectorAll('[data-localstorage_get]')
        get_els.forEach(input=>{
            let key = input.getAttribute('data-localstorage_get');
            if (!key) return;
            let value = storage.getItem(key)
            if(value != null){
                input.value = value;
            }
        });
        let remove_els = form.querySelectorAll('[data-localstorage_remove]')
        remove_els.forEach(input=>{
            input.value = '';
            let key = input.getAttribute('data-localstorage_remove');
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
	action: "localStorage",
	endEvent: "localStorage",
	callback: (btn, data) => {
		CoCreateLocalStorage.runStorage(btn)
	},
})

export default CoCreateLocalStorage;