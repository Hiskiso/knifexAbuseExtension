document.getElementById("form").addEventListener("submit", addnew)
let infonote = document.querySelector("body > div > div.abonus-container__note")
let input = document.querySelector("#new_account")
let versionNoteEl = document.querySelector(".version_note")
let manifestData = chrome.runtime.getManifest();

function addnew(e) {
    e.preventDefault();

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        var activeTab = tabs[0];

        chrome.tabs.sendMessage(activeTab.id, {
            "command": "setAcc", "id": e.target.children[0].children[0].children[0].value
        }, (response) => {
        });


    });


}

function updateList() {
    chrome.storage.sync.get(['account'], function (result) {
        if (result.account) {
            input.value = result.account;
        }

    });

}


window.onload = () => {
    versionNoteEl.innerText = "v " + manifestData.version
    input.onclick = function () {
        this.select();
    }
    updateList()

}

