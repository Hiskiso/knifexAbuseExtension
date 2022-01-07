window.accounts = [];
window.captcha = [];
window.timers = [];
window.logs = ""
window.loger = (message, style = "") => { console.log(message, style); window.logs = window.logs + message + "\n" }
window.isCapthaAdded = false;

window.onload = () => {
    try {
        
    window.scrollBy(window.innerWidth, window.innerHeight);
    websoketMain()
    captchaUpdater()

    chrome.storage.sync.get(['account'], function (result) {
        if (result.account) {
            window.accounts = [result.account];
        } else {
            window.loger("%cGet account by cookie", "color: blue; font-size: 50px");
            let id = parseCookie(document.cookie).id
            chrome.storage.sync.set({ account: id }, () => { })
        }

    });

    setInterval(() => {
        try {
            document.title = `${window.isCapthaAdded ? "✅ " : "❌ "} ${document.querySelector("#accordion__panel-giveaway > div.chat-giveaway__note").innerText}  | ${document.querySelector("#accordion__heading-giveaway > span:nth-child(3)").innerText}`
        } catch (error) {
            document.title = document.querySelector("#accordion__heading-giveaway > span:nth-child(2)").innerText
        }

    }, 1000)

    } catch (error) {
        window.loger(error)
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.command) {
            case "getlogs":
                {
                    sendResponse(window.logs)
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
            window.loger(">   " + '2');
            websk.send(2)
        }, 25000);
    };

    websk.onmessage = (data) => {



        window.loger('<   ' + data.data);

        if (data.data.toString().substring(0, 2) == '42') {

            data = JSON.parse(data.data.toString().substring(2))
            const promo = data[1]?.newPromoQuery?.name;
            window.loger("%c" + promo, "color: green; background: #0f2c51; font-size: 30px");



            window.accounts.forEach(async (account, num) => {
                fetch(`https:///knifex.best/api/user/freebie/promo`, {
                    method: 'POST',
                    body: JSON.stringify({ exclusive: false, promocode: promo, "captcha": window.captcha[num] }),
                    headers: {
                        "content-type": "application/json",
                        "meta-data": account,
                        "cookie": `id=${account}`,
                    }
                }).then(r => r.json()).then(r => {
                    if (r.data == "LIMIT") {
                        clearTimers();
                        knifexAlert("Pleace update captcha", "bad")
                        window.loger("%cLIMIT", "color: red; background: #0f2c51; font-size: 30px");
                    }
                    else if (r.ok == true) {
                        knifexAlert("PROMO ACTIVATED");
                        window.loger("%cPROMO +++ " + account + " " + JSON.stringify(r) + " ", "color: green; background: #0f2c51; font-size: 30px")
                    }
                    else {
                        window.loger(JSON.stringify(r) + ' ' + account)
                    }
                })
            });
            clearTimers()

        }
    }

    websk.onclose = () => {
        websoketMain()
    }

}


function clearTimers() {
    console.log("clear",window.isCapthaAdded)
    window.isCapthaAdded = false;
    window.timers.map(el => { clearTimeout(el); window.loger("All timers clear") })
    window.timers = []
    
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

function captchaUpdater() {
    window.temp = document.querySelector("textarea[name='g-recaptcha-response'").value


    setInterval(() => {
        try {
            if (window.temp != document.querySelector("textarea[name='g-recaptcha-response'").value) {

                window.timers.map(timer=>clearTimeout(timer))

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
            console.log(er);
        }
    }, 1000)


}