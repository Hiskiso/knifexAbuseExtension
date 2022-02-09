chrome.contextMenus.create({title: "Last Promo", onclick:(info, tab)=>{sendCommand("lastpromo")}})

function sendCommand(command, args=""){
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        let args = command.split(" ");
        args.shift();

        chrome.tabs.sendMessage(activeTab.id, { "command": command.split(" ")[0] }, (response) =>{});


    });
}