let btns_localStorageBtn = document.querySelectorAll('.localStorageBtn');
let storage = window.localStorage;
btns_localStorageBtn.forEach(btn=>{
    
    btn.addEventListener("click",function(e){
        e.preventDefault()
        let forms = btn.form;
        let elements_localstorage_set = forms.querySelectorAll('[data-localstorage_set]')
        elements_localstorage_set.forEach(input=>{
            if(input.value){
                storage.setItem(input.dataset['localstorage_set'], input.value);
            }
        });
        let elements_localstorage_get = forms.querySelectorAll('[data-localstorage_get]')
        elements_localstorage_get.forEach(input=>{
            let value = storage.getItem(input.dataset['localstorage_get'])
            if(value!=null){
                input.value = value;
            }
        });
        let elements_localstorage_remove = forms.querySelectorAll('[data-localstorage_remove]')
        elements_localstorage_remove.forEach(input=>{
                input.value = '';
                storage.removeItem(input.dataset['localstorage_remove'])
        });
    });
    
});