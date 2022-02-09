window.accounts = [];
window.captcha = [];
window.timers = [];
window.logs = ""
window.lastPromo = ''
window.loger = (message, style = "") => { console.log(message, style); window.logs = window.logs + message + "\n" }
window.isCapthaAdded = false;

removeUi();

window.onload = () => {
    try {     
            chrome.storage.sync.get(['account'], function (result) {
            if (result.account) {
                window.accounts = [result.account];
                document.cookie = "id=" + result.account + ";"
            } else {
                window.loger("%cGet account by cookie", "color: blue; font-size: 50px");
                let id = parseCookie(document.cookie).id
                chrome.storage.sync.set({ account: id }, () => { })
                location.reload(true)
            }

        });

        websoketMain();
        captchaUpdater();
        getProfileInfo();
       
        setInterval(() => {
            try {
                document.title = `${window.isCapthaAdded ? "✅ " : "❌ "} ${document.querySelector("#accordion__panel-giveaway > div.chat-giveaway__note").innerText}  | ${document.querySelector("#accordion__heading-giveaway > span:nth-child(3)").innerText}`
            } catch (error) {
                document.title = document.querySelector("#accordion__heading-giveaway > span:nth-child(2)").innerText
            }

        }, 1000)


    } catch (error) {
        if(error.message == "Cannot read properties of null (reading 'value')"){
            location.reload(true)
        }

        window.loger(error)
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request);
        switch (request.command) {
            case "getlogs": {
                navigator.clipboard.writeText(window.logs)
                sendResponse("Скопированно");
            }
                break;

            case "lastpromo": {
                applyPromo(window.lastPromo, (result)=>{console.log(result);})
            }
                break;
            case "resetid": {
                let id = parseCookie(document.cookie).id
                chrome.storage.sync.set({ account: id }, () => { })
                sendResponse("Готово")
                location.reload(true)
            }
                break;
            case "reload": {
                location.reload(true)
            }
                break;
            case "toggleUI": {
                chrome.storage.sync.get(['show_UI'], function (result) {
                    console.log(result);
                    chrome.storage.sync.set({show_UI: !result.show_UI}, function (result) {})
                })
                location.reload(true)
            }
                break;

            default:
                break;
        }
    });

function websoketMain() {
    websk = new WebSocket("wss://knifex.best:2083/socket.io/?EIO=3&transport=websocket");

    websk.onopen = () => {
        window.loger(window.accounts);
        websk.send(`420["join",{"ott":"2d3df9d5-b54f-4720-9d13-667479c968d0"}]`)
        window.loger("%c>   " + 'Joined', "color: blue");
        websk.send(2)
        setInterval(() => {
            websk.send(2)
        }, 25000);
    };

    websk.onmessage = (data) => {

        data.data !== '3' && window.loger('<   ' + data.data);

        if (data.data.toString().substring(0, 2) == '42') {

            data = JSON.parse(data.data.toString().substring(2))
            const promo = data[1]?.newPromoQuery?.name;
            window.loger("%c" + promo, "color: green; background: #0f2c51; font-size: 30px");

            if (window.lastPromo !== promo) {
                applyPromo(promo);
                clearTimers()
            }
            window.lastPromo = promo
        }
    }

    websk.onclose = () => {
        websoketMain()
    }

}

async function applyPromo(promo, callback = () => { }) {
    window.accounts.forEach(async (account, num) => {
      let request = await fetch(`https:///knifex.best/api/user/freebie/promo`, {
            method: 'POST',
            body: JSON.stringify({ exclusive: false, promocode: promo, "captcha": window.captcha[num] }),
            headers: {
                "content-type": "application/json",
                "meta-data": account,
                "cookie": `id=${account}`,
            }
        })
        let r = await request.json()
            if (r.data == "LIMIT") {
                clearTimers();
                knifexAlert("Limit - please update captcha", "bad")
                window.loger("%cLIMIT", "color: red; background: #0f2c51; font-size: 30px");
            }
            else if (r.ok == true) {
                knifexAlert("PROMO ACTIVATED " + window.lastPromo);
                window.loger("%cPROMO +++ " + account + " " + JSON.stringify(r) + " ", "color: green; background: #0f2c51; font-size: 30px")
            }
            else if(r.data == "NOT_FOUND")
            {
                knifexAlert(promo + " Not found", "bad")
            }
            else if(r.data == "BONUS_REST")
            {
                knifexAlert("Max count bonus items in inventory", "bad")
            }
            else {
                knifexAlert(promo, "bad")
                window.loger(JSON.stringify(r) + ' ' + account)
            }
            callback(r.data)
        
    });
}

function clearTimers() {
    window.isCapthaAdded = false;
    window.timers.map(el => { clearTimeout(el); window.loger("All timers clear") })
    window.timers = []

}

async function getProfileInfo(){
    let request = await fetch("https://knifex.best/api/user/initial", {
        headers: {
            "content-type": "application/json",
            "meta-data": accounts[0],
            "cookie": `id=${accounts[0]}`,
        }
    });

    let data = await request.json();

    window.lastPromo = data.data.c_p.newPromoQuery.name
}

const parseCookie = str =>
    str
        .split(';')
        .map(v => v.split('='))
        .reduce((acc, v) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
            return acc;
        }, {});


function knifexAlert(message, type = "good") {
    let elAlertKnifex = document.getElementById("__react-alert__");
    elAlertKnifex.innerHTML = ""
    elAlertKnifex.innerHTML = `<div loginerrtimeout="7000" style="left: 0px; position: fixed; display: flex; justify-content: center; align-items: flex-start; flex-direction: column; width: 100%; pointer-events: none; bottom: 0px; z-index: 100;"><div style="transform: scale(1); transition: all 250ms ease-in-out 0s;"><div class="ntf ntf--${type == "good" ? "good" : "bad"}" style="margin: 10px; pointer-events: all;">${message}</div></div></div>`
    setTimeout(() => { elAlertKnifex.innerHTML = "" }, 7000)
}

function removeUi(){
    chrome.storage.sync.get(['show_UI'], function (result) {
       if(result.show_UI){
        document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.mbonus.layoutSection").style.display = "none"
        document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.hbonus.layoutSection").style.display = "none"
        document.querySelector("#root > div > header").style.display = "none"
        document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.abonus.layoutSection > div.abonus-grid").style.display = "none"
        document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.abonus.layoutSection > div.abonus-container.abonus-container-main > div").style.display = "none"
    }
    })
}

function captchaUpdater() {
    try{
        window.temp = document.querySelector("textarea[name='g-recaptcha-response'").value
    }
    catch{
        location.reload(true)
    }

    setInterval(() => {
        try {
            if (window.temp != document.querySelector("textarea[name='g-recaptcha-response'").value && document.querySelector("textarea[name='g-recaptcha-response'").value !== "") {

                window.timers.map(timer => clearTimeout(timer))

                window.temp = document.querySelector("textarea[name='g-recaptcha-response'").value
                window.captcha.shift()
                window.loger("%cCaptcha added", "color: green")
                window.captcha.push(window.temp);
                window.isCapthaAdded = true;
                let ifr = document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.abonus.layoutSection > div.abonus-container.abonus-container-main > form > div.abonus-container__recaptcha > div > div > div > div > div > iframe")
                ifr.src = ifr.src

                let timer = setTimeout(() => { clearTimers(); knifexAlert("Captcha Expired", "bad"); window.loger("%cCaptcha Expired!!", "color: red; background: #0f2c51; font-size: 30px"); }, 60000)
                window.timers.push(timer)

                knifexAlert("Captcha added");

            }
        } catch (er) {
            knifexAlert("Для избежания ошибок страница перезагружена!")
            location.reload(true)
        }
    }, 1000)


}