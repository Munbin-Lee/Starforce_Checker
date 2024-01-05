class StarforceStat {
    constructor(star, successRate, destroyRate, failRate) {
        this.star = star
        this.successRate = successRate
        this.destroyRate = destroyRate
        this.failRate = failRate
        this.totalObserved = 0
        this.successObserved = 0
        this.destroyObserved = 0
        this.failObserved = 0
    }
}

class StarforceResult {
    static maxStar = 25

    getSuccessRate(star) {
        return 0
    }

    getDestroyRate(star) {
        return 0
    }

    constructor() {
        this.stats = []

        for (const star of Array(this.constructor.maxStar).keys()) {
            const successRate = this.getSuccessRate(star)
            const destroyRate = this.getDestroyRate(star)
            const failRate = 10000 - successRate - destroyRate
            const stat = new StarforceStat(star, successRate, destroyRate, failRate)
            this.stats.push(stat)
        }
    }
}

class NormalResult extends StarforceResult {
    getSuccessRate(star) {
        if (star <= 2) return 9500 - 500 * star
        if (star <= 13) return 10000 - 500 * star
        if (star <= 21) return 3000
        return 2500 - 100 * star
    }

    getDestroyRate(star) {
        if (star <= 14) return 0
        if (star <= 17) return 210
        if (star <= 19) return 280
        if (star <= 21) return 700
        if (star == 22) return 1940
        if (star == 23) return 2940
        return 3960
    }
}

class CatchResult extends StarforceResult {
    getSuccessRate(star) {
        if (star <= 2) return 9975 - 525 * star
        if (star <= 13) return 10500 - 525 * star
        if (star <= 21) return 3150
        return 2625 - 105 * star
    }

    getDestroyRate(star) {
        if (star <= 14) return 0
        if (star <= 17) return 206
        if (star <= 19) return 274
        if (star <= 21) return 685
        if (star == 22) return 1937
        if (star == 23) return 2937
        return 3958
    }
}

class SuperiorResult extends StarforceResult {
    static maxStar = 15

    getSuccessRate(star) {
        if (star <= 1) return 5000
        if (star == 2) return 4500
        if (star <= 8) return 4000
        if (star == 9) return 3700
        if (star <= 11) return 3500
        return 1500 - 100 * star
    }

    getDestroyRate(star) {
        if (star <= 4) return 0
        if (star <= 7) return 120 * star - 420
        if (star <= 10) return 350 * star - 2200
        if (star == 11) return 1630
        return 4250 + 50 * star
    }
}

class SuperiorCatchResult extends StarforceResult {
    static maxStar = 15

    getSuccessRate(star) {
        if (star <= 1) return 5250
        if (star == 2) return 4725
        if (star <= 8) return 4200
        if (star == 9) return 3885
        if (star <= 11) return 3675
        return 1575 - 105 * star
    }

    getDestroyRate(star) {
        if (star <= 4) return 0
        if (star == 5) return 174
        if (star == 6) return 290
        if (star == 7) return 406
        if (star == 8) return 580
        if (star == 9) return 922
        if (star == 10) return 1265
        if (star == 11) return 1586
        if (star == 12) return 4843
        if (star == 13) return 4895
        if (star == 14) return 4948
    }
}

const starforceResults = [new NormalResult(), new CatchResult(), new SuperiorResult(), new SuperiorCatchResult()]

const starforceTbody = document.getElementById('starforce_tbody')

function refreshTable() {
    const hideEmptyRow = document.getElementById('hide_empty_row').checked
    const hideLowStar = document.getElementById('hide_low_star').checked
    const onlyShowProb = document.getElementById('only_show_prob').checked
    const superiorOn = document.getElementById('superior_on').checked
    const catchOn = document.getElementById('catch_on').checked

    let stats = starforceResults[0].stats
    if (!superiorOn && catchOn) {
        stats = starforceResults[1].stats
    } else if (superiorOn && !catchOn) {
        stats = starforceResults[2].stats
    } else if (superiorOn && catchOn) {
        stats = starforceResults[3].stats
    }

    let innerHTML = ''

    stats.forEach((stat) => {
        if (hideEmptyRow && stat.totalObserved == 0) return

        if (hideLowStar && !superiorOn && stat.star < 15) return

        innerHTML += '<tr align="center">'

        innerHTML += '<td>' + stat.star + ' -> ' + (stat.star + 1) + '</td>';
        innerHTML += '<td>' + stat.totalObserved + '</td>'

        for (const [rate, observed] of [[stat.successRate, stat.successObserved],
        [stat.failRate, stat.failObserved], [stat.destroyRate, stat.destroyObserved]]) {
            innerHTML += '<td>' + (rate / 100).toFixed(2) + '%'
            if (!onlyShowProb) innerHTML += ' , ' + (rate * stat.totalObserved / 10000).toFixed(2) + '회'
            innerHTML += '</td>'

            innerHTML += '<td>' + (observed / stat.totalObserved * 100).toFixed(2) + '%'
            if (!onlyShowProb) innerHTML += ' , ' + observed + '회'
            innerHTML += '</td>'
        }

        innerHTML += '</tr>'
    })

    starforceTbody.innerHTML = ''
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
                if (history.chance_time == '찬스타임 적용') continue

                if (history.destroy_defence == '파괴 방지 적용') continue

                const star = history.before_starforce_count

                let stat = starforceResults[0].stats[star]

                if (history.superior_item_flag != '슈페리얼 장비' && history.starcatch_result == '성공') {
                    stat = starforceResults[1].stats[star]
                } else if (history.superior_item_flag == '슈페리얼 장비' && history.starcatch_result != '성공') {
                    stat = starforceResults[2].stats[star]
                } else if (history.superior_item_flag == '슈페리얼 장비' && history.starcatch_result == '성공') {
                    stat = starforceResults[3].stats[star]
                }

                stat.totalObserved += 1

                if (history.item_upgrade_result == '성공') {
                    stat.successObserved += 1
                } else if (history.item_upgrade_result == '실패(유지)' ||
                    history.item_upgrade_result == '실패(하락)') {
                    stat.failObserved += 1
                } else {
                    stat.destroyObserved += 1
                }
            }
        })
        .catch(error => {
            console.log(error)
        })
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

const dateFrom = new Date('2023-12-27T09:00:00')
const dateTo = new Date()
dateTo.setHours(9)

async function getAllStarforceData() {
    const getDataButton = document.getElementById('get_data_button')
    getDataButton.disabled = true

    const apiKey = document.getElementById('api_key_text').value

    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    document.cookie = 'apiKey=' + apiKey + '; expires=' + expirationDate.toUTCString()

    starforceResults[0] = new NormalResult()
    starforceResults[1] = new CatchResult()
    starforceResults[2] = new SuperiorResult()
    starforceResults[3] = new SuperiorCatchResult()

    for (const date = dateFrom; date <= dateTo; date.setDate(date.getDate() + 1)) {
        const paramDate = date.toISOString().slice(0, 10)

        await getStarforceData(apiKey, paramDate)

        await sleep(200)
    }

    refreshTable()

    getDataButton.disabled = false
}

function getCookieValue(name) {
    const regex = new RegExp(`(^| )${name}=([^;]+)`)
    const match = document.cookie.match(regex)

    if (match) return match[2]

    return null
}

window.onload = () => {
    const apiKey = getCookieValue('apiKey')

    if (apiKey == null) return

    document.getElementById('api_key_text').value = apiKey
}