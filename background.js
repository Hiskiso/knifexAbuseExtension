chrome.contextMenus.create({title: "Last Promo", onclick:(info, tab)=>{sendCommand("lastpromo")}})
chrome.contextMenus.create({title: "Reset Id", onclick:(info, tab)=>{sendCommand("resetid")}})
chrome.contextMenus.create({title: "Toggle UI", onclick:(info, tab)=>{sendCommand("toggleUI")}})
chrome.contextMenus.create({type:"separator"})
chrome.contextMenus.create({title: "stop spamming", onclick:(info, tab)=>{sendCommand("spamStop")}})
chrome.contextMenus.create({title: "spam 5", onclick:(info, tab)=>{sendCommand("spam", {count: 5})}})
chrome.contextMenus.create({title: "spam 10", onclick:(info, tab)=>{sendCommand("spam", {count: 10})}})
chrome.contextMenus.create({title: "spam 50", onclick:(info, tab)=>{sendCommand("spam", {count: 50})}})



function sendCommand(command, args= {}){
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { "command": command.split(" ")[0], ...args });


    });
}