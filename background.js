chrome.contextMenus.create({title: "Last Promo", onclick:(info, tab)=>{sendCommand("lastpromo")}})
chrome.contextMenus.create({title: "Reset Id", onclick:(info, tab)=>{sendCommand("resetid")}})

chrome.storage.sync.get(['show_UI'], function (result) {
    chrome.contextMenus.create({title: "Remove UI", checked: result.show_UI, type: "checkbox", onclick:(info, tab)=>{sendCommand("toggleUI")}})

})


function sendCommand(command, args=""){
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        let args = command.split(" ");
        args.shift();

        chrome.tabs.sendMessage(activeTab.id, { "command": command.split(" ")[0] });


    });
}