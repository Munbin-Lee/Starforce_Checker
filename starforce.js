function getSuccessRate(star) {
    if (star <= 2) return 95 - 5 * star
    if (star <= 14) return 100 - 5 * star
    if (star <= 21) return 30
    return 25 - star
}

function getDestroyRate(star) {
    if (star <= 14) return 0
    if (star <= 17) return 2.1
    if (star <= 19) return 2.8
    if (star <= 21) return 7
    if (star == 22) return 19.4
    if (star == 23) return 29.4
    return 39.6
}

class Starforce {
    constructor(star) {
        this.star = star
        this.count = 0
        this.success_rate = getSuccessRate(star)
        this.success_observed = 0
        this.destory_rate = getDestroyRate(star)
        this.destory_observed = 0
        this.fail_rate = 100 - getSuccessRate(star) - getDestroyRate(star)
        this.fail_observed = 0
    }
}

let starforces = []

const starforceTbody = document.getElementById('starforce_tbody')

function refreshTable() {
    starforceTbody.innerHTML = ''

    const hideEmptyRow = document.getElementById('hide_empty_row').checked
    const onlyShowProb = document.getElementById('only_show_prob').checked

    let innerHTML = ''

    starforces.forEach((starforce) => {
        if (hideEmptyRow && starforce.count == 0) return

        innerHTML += '<tr align="center">'

        innerHTML += '<td>' + starforce.star + ' -> ' + (starforce.star + 1) + '</td>';
        innerHTML += '<td>' + starforce.count + '</td>'

        innerHTML += '<td>' + starforce.success_rate.toFixed(2) + '%'
        if (!onlyShowProb) innerHTML += ' , ' + (starforce.count * starforce.success_rate / 100).toFixed(2) + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + (starforce.success_observed / starforce.count * 100).toFixed(2) + '%'
        if (!onlyShowProb) innerHTML += ' , ' + starforce.success_observed + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + starforce.fail_rate.toFixed(2) + '%'
        if (!onlyShowProb) innerHTML += ' , ' + (starforce.count * starforce.fail_rate / 100).toFixed(2) + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + (starforce.fail_observed / starforce.count * 100).toFixed(2) + '%'
        if (!onlyShowProb) innerHTML += ' , ' + starforce.fail_observed + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + starforce.destory_rate.toFixed(2) + '%'
        if (!onlyShowProb) innerHTML += ' , ' + (starforce.count * starforce.destory_rate / 100).toFixed(2) + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + (starforce.destory_observed / starforce.count * 100).toFixed(2) + '%'
        if (!onlyShowProb) innerHTML += ' , ' + starforce.destory_observed + '회'
        innerHTML += '</td>'

        innerHTML += '</tr>'


    })

    starforceTbody.insertAdjacentHTML('afterbegin', innerHTML)
}

const apiUrlBase = 'https://open.api.nexon.com/maplestory/v1/history/starforce?count=1000&date='

async function getStarforceData(apiKey, date) {
    const apiUrl = apiUrlBase + date

    fetch(apiUrl, {
        headers: {
            'x-nxopen-api-key': apiKey
        }
    })
        .then(response => response.json())
        .then(data => {
            for (const history of Object.values(data.starforce_history)) {
                star = history.before_starforce_count
                starforces[star].count += 1

                if (history.item_upgrade_result == '성공') {
                    starforces[star].success_observed += 1
                } else if (history.item_upgrade_result == '실패(유지)' ||
                    history.item_upgrade_result == '실패(하락)') {
                    starforces[star].fail_observed += 1
                } else {
                    starforces[star].destory_observed += 1
                }
            }
        })
        .then(() => refreshTable())
        .catch(error => {
            console.log(error)
        })
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

const dateFrom = new Date("2023-12-27T09:00:00")
const dateTo = new Date()
dateTo.setHours(dateTo.getHours() + 9)

async function getAllStarforceData() {
    const apiKey = document.getElementById('api_key_text').value

    starforces = []

    for (const x of Array(25).keys()) {
        starforces.push(new Starforce(x));
    }

    for (const date = dateFrom; date <= dateTo; date.setDate(date.getDate() + 1)) {
        const paramDate = date.toISOString().slice(0, 10)

        getStarforceData(apiKey, paramDate)

        await sleep(250)
    }
}