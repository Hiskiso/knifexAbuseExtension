window.accounts = [];
window.captcha = [];
window.timers = []


window.onload = () => {

    websoketMain()
    captchaUpdater()

    chrome.storage.sync.get(['account'], function (result) {
        if (result.account) {
            window.accounts = [result.account];
        } else {
            console.log("%cACCOUNT NOT ENTERED", "color: red; font-size: 50px")
        }

    });
}

function knifexAlert(message, type="good"){
    let elAlertKnifex = document.getElementById("__react-alert__");
   elAlertKnifex.innerHTML = `<div loginerrtimeout="7000" style="left: 0px; position: fixed; display: flex; justify-content: center; align-items: flex-start; flex-direction: column; width: 100%; pointer-events: none; bottom: 0px; z-index: 100;"><div style="transform: scale(1); transition: all 250ms ease-in-out 0s;"><div class="ntf ntf--${type=="good"? "good": "bad"}" style="margin: 10px; pointer-events: all;">${message}</div></div></div>`
    setTimeout(()=>{elAlertKnifex.innerHTML = ""}, 7000)
}

function captchaUpdater() {
    window.temp = document.querySelector("#g-recaptcha-response").value

    setInterval(() => {
        if (window.temp != document.querySelector("#g-recaptcha-response").value) {

            clearTimers()
            knifexAlert("Captcha added")
            window.temp = document.querySelector("#g-recaptcha-response").value
            window.captcha.shift()
            console.log("%cCaptcha added", "color: green")
            window.captcha.push(window.temp);
            let ifr = document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.abonus.layoutSection > div.abonus-container.abonus-container-main > form > div.abonus-container__recaptcha > div > div > div > div > div > iframe")
            ifr.src = ifr.src

            let timer = setTimeout(() => {knifexAlert("Captcha Expired", "bad"); console.log("%cCaptcha Expired!!", "color: red; background: #0f2c51; font-size: 30px"); }, 60000)
            window.timers.push(timer)

        }
    }, 1000)


}

function clearTimers() {
    window.timers.map(el => { clearTimeout(el); console.log("All timers clear") })

}

function websoketMain() {
    websk = new WebSocket("wss://knifex.best:2083/socket.io/?EIO=3&transport=websocket");

    websk.onopen = () => {
        console.log(window.accounts);
        websk.send(`420["join",{"ott":"9306472d-949b-4258-99b4-774752860cd1"}]`)
        console.log("%c>   " + 'Joined', "color: blue");
        websk.send(2)
        setInterval(() => {
            console.log(">   " + '2');
            websk.send(2)
        }, 25000);
    };

    websk.onmessage = (data) => {

        

        console.log('<   ' + data.data);

        if (data.data.toString().substring(0, 2) == '42') {

            data = JSON.parse(data.data.toString().substring(2))
            const promo = data[1]?.newPromoQuery?.name;
            console.log("%c" + promo, "color: green; background: #0f2c51; font-size: 30px");

            if (data.data == "LIMIT") {
                clearTimers();
                knifexAlert("Pleace update captcha", "bad")
                console.log("%cLIMIT", "color: red; background: #0f2c51; font-size: 30px");
            } else {

                window.accounts.forEach(async (account, num) => {
                    fetch(`https:///knifex.best/api/user/freebie/promo`, {
                        method: 'POST',
                        body: JSON.stringify({ exclusive: false, promocode: promo, "captcha": window.captcha[num] }),
                        headers: {
                            "content-type": "application/json",
                            "meta-data": account,
                            "cookie": `id=${account}`,
                        }
                    }).then(r => r.json()).then(r => { if (r.ok == true) { knifexAlert("PROMO ACTIVATED");console.log("%cPROMO +++ " + account + " " + JSON.stringify(r) + " ", "color: green; background: #0f2c51; font-size: 30px") } else { console.log(JSON.stringify(r) + ' ' + account) } })
                });
                clearTimers()
            }
        }
    }

    websk.onclose = () => {
        websoketMain()
    }

}