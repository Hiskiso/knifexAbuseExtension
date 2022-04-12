window.account = '';
window.captcha = [];
window.timers = [];
window.lastPromo = '';
window.isCapthaAdded = false;
window.isPromoCaptured = false;
window.isEternalStop = false;
window.knifexProfile = {};
window.canAutoBet = false;
window.currentChatScore = "";

window.onload = () => {
    console.clear()
    removeUi();

    try {

        chrome.storage.sync.get(null, function (result) {
            console.table(result)
            if (result.account) {
                window.account = result.account;
            } else {
                console.log("%cGet account by cookie", "color: blue; font-size: 50px");
                let id = parseCookie(document.cookie).id
                chrome.storage.sync.set({account: id}, () => {
                })
                location.reload()
            }

            if (result.autoBet) {
                window.canAutoBet = result.autoBet
            } else {
                chrome.storage.sync.set({autoBet: false}, () => {
                })
            }

        });


        websoketMain();
        captchaUpdater();
        titleUpdater();


    } catch (error) {
        if (error.message === "Cannot read properties of null (reading 'value')") {
            location.reload();
        }

        console.log(error);
    }
};


function titleUpdater() {
    setInterval(() => {
        try {
            let time = document.querySelector("#accordion__heading-giveaway > span:nth-child(3)").innerText
            let chatScore = document.querySelector("#accordion__panel-giveaway > div.chat-giveaway__note").innerText

            window.currentChatScore = chatScore.slice(0, 3);

            document.title = `${window.isCapthaAdded ? "✅ " : "❌ "} ${chatScore}  | ${time}`

        } catch (error) {
            document.title = document.querySelector("#accordion__heading-giveaway > span:nth-child(2)").innerText + `${window.isPromoCaptured ? "✅ " : "❌ "}`;
        }

    }, 1000);
}


function chatSpam() {


    let messagesSocket = new WebSocket("wss://knifex.best:2053/socket.io/?EIO=3&transport=websocket");
    let msgPrefix = "421";

    let arr = ["z", "промо", "погнали", "спс", "!statsbet", "паль", "успеем", "!statsdep", "го фаст", "чу-чуть осталось", "пишем", "топим", "go", "гого", "гг", "го"];

    const delay = (n) => {
        return new Promise(res => {
            let tm = setTimeout(() => res(tm), n);
        })
    };


    let before = "";

    function getRandom() {
        let tempRandom = arr[Math.random() * arr.length | 0];
        if (before !== tempRandom) {

            before = tempRandom;
            return tempRandom;

        } else {
            return getRandom();
        }
    }

    messagesSocket.onopen = () => {
        messagesSocket.send(`420["join",{"ott": "${window.knifexProfile.u.gauth}"}]`);


        let interval = setInterval(() => {
            if (Number(window.currentChatScore) < 200) {
                let msg = msgPrefix++ + `["say",{"msg": "${getRandom()}","c_rm":"ru"}]`
                messagesSocket.send(msg)
                console.log(msg);
            } else clearInterval(interval)
        }, 5500);
    }
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
    switch (request.command) {
        case "getlogs": {
            navigator.clipboard.writeText(window.logs)
            sendResponse("Скопированно");
        }
            break;

        case "lastpromo": {
            applyPromo(window.lastPromo)
        }
            break;
        case "resetid": {
            let id = parseCookie(document.cookie).id
            chrome.storage.sync.set({account: id}, () => {
            })
            sendResponse("Готово")
            location.reload()
        }
            break;
        case "reload": {
            location.reload()
        }
            break;
        case "toggleUI": {
            chrome.storage.sync.get(['show_UI'], function (result) {
                console.log(result);
                chrome.storage.sync.set({show_UI: !result.show_UI}, function (result) {
                });
            });
            location.reload()
        }
            break;
        case "spam": {
            chatSpam();
        }
            break;
        case "spamStop": {
            window.isEternalStop = true;
        }
            break;
        case "clashBet": {
            clashBet();
        }
            break;
        case "clashBetByArgs": {
            clashBet(request.coef, request.onlyBonus, request.hasRety);
        }
            break;
        case "toggleAutobet": {
            chrome.storage.sync.get(['autoBet'], function (result) {
                console.log(result);
                chrome.storage.sync.set({autoBet: !result.autoBet}, function (result) {
                });
            });
            location.reload()
        }
            break;
        case "setAcc": {
            chrome.storage.sync.set({account: request.id}, () => {
            })
            document.cookie = `id=${request.id}; path=/;`;
            location.reload()
        }
            break;

        default:
            break;
    }
});

function websoketMain() {
    websk = new WebSocket("wss://knifex.best:2083/socket.io/?EIO=3&transport=websocket");

    websk.onopen = () => {
        getProfileInfo().then(profileData => {
            websk.send(`420["join",{"ott":"${profileData.data.u.gauth}"}]`);
            window.lastPromo = profileData.data.c_p.newPromoQuery.name;
            window.knifexProfile = profileData.data
        });

        console.log("%c>   " + 'Joined', "color: blue");
        websk.send("2");
        setInterval(() => {
            websk.send("2");
        }, 25000);
    };

    websk.onmessage = (data) => {

        data.data !== '3' && console.log('<   ' + data.data);

        if (data.data.toString().includes(`newPromoQuery`)) {

            data = JSON.parse(data.data.toString().substring(2));
            const promo = data[1]?.newPromoQuery?.name;
            console.log("%c" + promo, "color: green; background: #0f2c51; font-size: 30px");

            if (window.lastPromo !== promo) {
                applyPromo(promo).then();
                clashBet().then();
                clearTimers();
            }
            window.lastPromo = promo;
        }
    }

    websk.onclose = () => {
        websoketMain();
    }

}

async function clashBet(coef = "350", onlyBonus = true, hasRety = true, autoSell=true) {

    let profile = await getProfileInfo();
    let inventory = profile.data.i;
    let prefix = "419";
    console.log("inventory", inventory);

    if (inventory.length === 0) return

    let chatSocket = new WebSocket("wss://knifex.best:2053/socket.io/?EIO=3&transport=websocket");
    chatSocket.onmessage = (message) => {

        if (message.data.toString() === "40") {
            chatSocket.send(++prefix + JSON.stringify(["join", {"ott": profile.data.u.gauth}]));
            chatSocket.send(++prefix + JSON.stringify(["joy", {"rm": "cla"}]));
        }

        if (message.data.toString().includes("STARTING")) {

            for (let item in inventory) {

                item = inventory[item];

                if (item.b === onlyBonus) {
                    let msg = ["b", {"autoCashOut": coef, "i": [item.i], "rm": "cla"}];
                    console.log(msg);
                    chatSocket.send(++prefix + JSON.stringify(msg));
                }
            }

            if (hasRety) {
                setTimeout(() => {
                    if (inventory.length !== 0) {
                        setTimeout(clashBet, 1000)
                    }
                }, 1500)
            }


            chatSocket.close();


        }
    }

}

async function sellAll(){
    let profile = await getProfileInfo();
    let inventory = profile.data.i;

    let requset = await fetch('https://knifex.best/api/items/sell-items', {
        method: "POST",
        body: JSON.stringify({buy: [], sell: inventory.map(el=>el.i)}),
        headers: {"content-type": "application/json", "meta-data": window.account, "cookie": `id=${window.account}`}
    })
}


async function applyPromo(promo) {

    if(promo === undefined) return

    let request = await fetch(`https:///knifex.best/api/user/freebie/promo`, {
        method: 'POST',
        body: JSON.stringify({exclusive: false, promocode: promo, "captcha": window.captcha[0]}),
        headers: {
            "content-type": "application/json", "meta-data": window.account, "cookie": `id=${window.account}`,
        }
    })

    let r = await request.json();
    if (r.data === "LIMIT") {
        clearTimers();
        knifexAlert("Limit - please update captcha", "bad");
        console.log("%cLIMIT", "color: red; background: #0f2c51; font-size: 30px");
    } else if (r.ok === true) {
        knifexAlert("PROMO ACTIVATED " + window.lastPromo);
        window.isPromoCaptured = true;
        console.log("%cPROMO +++ " + window.account + " " + JSON.stringify(r) + " ", "color: green; background: #0f2c51; font-size: 30px");
    } else if (r.data === "NOT_FOUND") {
        knifexAlert(promo + " Not found", "bad")
    } else if (r.data === "BONUS_REST") {
        knifexAlert("Max count bonus items in inventory", "bad");
    } else {
        knifexAlert(promo, "bad")
        console.log(JSON.stringify(r) + ' ' + window.account);
    }

    return r.data


}

function clearTimers() {
    window.isPromoCaptured = false;
    window.isCapthaAdded = false;
    window.timers.map(el => {
        clearTimeout(el);
        console.log("All timers clear");
    });
    window.timers = []

}


/**
 *
 * @returns data {
 *         data: {
 *             b: null,
 *             c: 14735,
 *             c_g: null,
 *             c_p: {},
 *             st: [],
 *             u: {
 *                 avatar: "",
 *                 balance: 0,
 *                 bonusUsed: true,
 *                 gauth: "",
 *                 hasRef: true,
 *                 id: 0,
 *                 name: "",
 *                 nickNameAcquired: 0,
 *                 refFirstBonusAvailable: true,
 *                 referrerId: 0,
 *                 role: "USER",
 *                 steamId: "0",
 *                 steamLevel: 0,
 *                 tradeLink: "",
 *                 vkBinded: true
 *             }
 *         }
 *     }
 *
 */
async function getProfileInfo() {
    let request = await fetch("https://knifex.best/api/user/initial", {
        headers: {
            "content-type": "application/json", "meta-data": window.account, "cookie": `id=${window.account}`,
        }
    });

    return await request.json();
}

const parseCookie = str => str
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
    }, {});


function knifexAlert(message, type = "good") {
    let elAlertKnifex = document.getElementById("__react-alert__");
    elAlertKnifex.innerHTML = ""
    elAlertKnifex.innerHTML = `<div loginerrtimeout="7000" style="position: fixed; display: flex; left: 0px; bottom: 0px; justify-content: center; align-items: flex-start; flex-direction: column; width: 100%; pointer-events: none; z-index: 100;"><div style="transform: scale(1); transition: all 250ms ease-in-out 0s;"><div class="ntf ntf--${type === "good" ? "good" : "bad"}" style="margin: 10px; pointer-events: all;">${message}</div></div></div>`
    setTimeout(() => {
        elAlertKnifex.innerHTML = ""
    }, 7000)
}


function removeUi() {
    chrome.storage.sync.get(['show_UI'], function (result) {
        if (result.show_UI) {
            document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.mbonus.layoutSection").remove()
            document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.hbonus.layoutSection").remove()
            document.querySelector("#root > div > header").remove()
            document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.abonus.layoutSection > div.abonus-grid").remove()
            document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.abonus.layoutSection > div.abonus-container.abonus-container-main > div").remove()
        }
    })
}

function captchaUpdater() {
    try {
        window.temp = document.querySelector("textarea[name='g-recaptcha-response']").value
    } catch {
        location.reload()
    }

    setInterval(() => {
        try {
            if (window.temp !== document.querySelector("textarea[name='g-recaptcha-response']").value && document.querySelector("textarea[name='g-recaptcha-response']").value !== "") {

                window.timers.map(timer => clearTimeout(timer))

                window.temp = document.querySelector("textarea[name='g-recaptcha-response']").value
                window.captcha.shift()
                console.log("%cCaptcha added", "color: green")
                window.captcha.push(window.temp);
                window.isCapthaAdded = true;
                let ifr = document.querySelector("#root > div > div.AppLayout > div > div.bonus-col.gbonus > div.abonus.layoutSection > div.abonus-container.abonus-container-main > form > div.abonus-container__recaptcha > div > div > div > div > div > iframe")
                ifr.src = ifr.src

                let timer = setTimeout(() => {
                    clearTimers();
                    knifexAlert("Captcha Expired", "bad");
                    console.log("%cCaptcha Expired!!", "color: red; background: #0f2c51; font-size: 30px");
                }, 120000)
                window.timers.push(timer)

                knifexAlert("Captcha added");

            }
        } catch (er) {
            knifexAlert("Для избежания ошибок страница перезагружена!")
            // location.reload()
        }
    }, 1000)
}
