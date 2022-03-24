chrome.contextMenus.create({title: "Last Promo", onclick:(info, tab)=>{sendCommand("lastpromo")}})
chrome.contextMenus.create({title: "Reset Id", onclick:(info, tab)=>{sendCommand("resetid")}})
chrome.contextMenus.create({title: "Toggle UI", onclick:(info, tab)=>{sendCommand("toggleUI")}})
chrome.contextMenus.create({title: "Toggle autoBet", onclick:(info, tab)=>{sendCommand("toggleAutobet")}})
chrome.contextMenus.create({type:"separator"})
chrome.contextMenus.create({title: "stop spamming", onclick:(info, tab)=>{sendCommand("spamStop")}})
chrome.contextMenus.create({title: "spam", onclick:(info, tab)=>{sendCommand("spam")}})




function sendCommand(command, args= {}){
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { "command": command.split(" ")[0], ...args });


    });
}