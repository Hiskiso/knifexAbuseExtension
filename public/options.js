document.getElementById("form").addEventListener("submit", addnew)
let id = document.getElementById("idAcc")

function addnew(e){
e.preventDefault();
chrome.storage.sync.set({account: e.target.children[0].value}, ()=>{})
updateList()
}

function updateList(){
    chrome.storage.sync.get(['account'], function(result) {
        if (result.account) {
            id.innerText = result.account;
        } else{
            d.innerText = "Введите ниже айди"
        }
          
       });
      
}

updateList()