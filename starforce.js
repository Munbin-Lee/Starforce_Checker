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
            const successRate = this.constructor.getSuccessRate(star)
            const destroyRate = this.constructor.getDestroyRate(star)
            const failRate = 10000 - successRate - destroyRate
            const stat = new StarforceStat(star, successRate, destroyRate, failRate)
            this.stats.push(stat)
        }
    }
}

class NormalResult extends StarforceResult {
    static getSuccessRate(star) {
        if (star <= 2) return 9500 - 500 * star
        if (star <= 14) return 10000 - 500 * star
        if (star <= 21) return 3000
        return 2500 - 100 * star
    }

    static getDestroyRate(star) {
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
    static getSuccessRate(star) {
        if (star <= 2) return 9975 - 525 * star
        if (star <= 14) return 10500 - 525 * star
        if (star <= 21) return 3150
        return 2625 - 105 * star
    }

    static getDestroyRate(star) {
        if (star <= 14) return 0
        if (star <= 17) return 206
        if (star <= 19) return 274
        if (star <= 21) return 685
        if (star == 22) return 1937
        if (star == 23) return 2937
        return 3958
    }
}

const starforceResults = [new NormalResult(), new CatchResult()]

const starforceTbody = document.getElementById('starforce_tbody')

function refreshTable() {
    const hideEmptyRow = document.getElementById('hide_empty_row').checked
    const onlyShowProb = document.getElementById('only_show_prob').checked
    const catchOn = document.getElementById('catch_on').checked

    let stats = starforceResults[0].stats
    if (catchOn) stats = starforceResults[1].stats

    let innerHTML = ''

    stats.forEach((stat) => {
        if (hideEmptyRow && stat.totalObserved == 0) return

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

                const star = history.before_starforce_count

                let stat = starforceResults[0].stats[star]

                if (history.starcatch_result == '성공') {
                    stat = starforceResults[1].stats[star]
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

    starforceResults[0] = new NormalResult()
    starforceResults[1] = new CatchResult()

    for (const date = dateFrom; date <= dateTo; date.setDate(date.getDate() + 1)) {
        const paramDate = date.toISOString().slice(0, 10)

        await getStarforceData(apiKey, paramDate)

        await sleep(200)
    }

    refreshTable()

    getDataButton.disabled = false
}