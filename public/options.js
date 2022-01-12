document.getElementById("form").addEventListener("submit", addnew)
let infonote = document.querySelector("body > div > div.abonus-container__note")
let input = document.querySelector("#new_account")
let versionNoteEl = document.querySelector(".version_note")
let  manifestData = chrome.runtime.getManifest();

function addnew(e){
e.preventDefault();
if (e.target.children[0].children[0].children[0].value.charAt(0) == "/") {

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];

    let command = e.target.children[0].children[0].children[0].value.slice(1)

    let args = command.split(" ");
    args.shift();

    chrome.tabs.sendMessage(activeTab.id, { "command": command.split(" ")[0]}, (response)=>{
        e.target.children[0].children[0].children[0].value = "";
        console.log(response);
        input.placeholder = "Применено"
    });
     
        
    });

} else{
            chrome.storage.sync.set({account: e.target.children[0].children[0].children[0].value}, ()=>{})
            updateList()
            chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
                var activeTab = tabs[0];
            
                chrome.tabs.sendMessage(activeTab.id, { "command": "reload"}, (response)=>{});
                 
                    
                });
    
}

}

function updateList(){
    chrome.storage.sync.get(['account'], function(result) {
        if (result.account) {
            input.value = result.account;
        }
          
       });
      
}


   window.onload = ()=>{
    versionNoteEl.innerText = "v " + manifestData.version
    input.onclick = function () {
        this.select();
       }

       chrome.storage.sync.get(['cryptoKey'], function (result) {
        if (!result.cryptoKey) {
            input.value = "";
            input.placeholder = "Введите ключ!"
        }

    });

   }

updateList()