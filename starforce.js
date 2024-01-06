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

class TotalStat extends StarforceStat {
    constructor(star, successRate, destroyRate, failRate) {
        super(star, successRate, destroyRate, failRate)

        this.totalSuccessRate = 0
        this.totalDestroyRate = 0
        this.totalFailRate = 0
    }

    addSuccessRate(rate) {
        this.totalSuccessRate += rate
        this.successRate = this.totalSuccessRate / this.totalObserved
    }

    addDestroyRate(rate) {
        this.totalDestroyRate += rate
        this.destroyRate = this.totalDestroyRate / this.totalObserved
    }

    addFailRate(rate) {
        this.totalFailRate += rate
        this.failRate = this.totalFailRate / this.totalObserved
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

    getCatchSuccessRate(star) {
        return 0
    }

    getCatchDestroyRate(star) {
        return 0
    }

    constructor() {
        this.stats = []
        this.catchStats = []
        this.totalStats = []

        for (const star of Array(this.constructor.maxStar).keys()) {
            const successRate = this.getSuccessRate(star)
            const destroyRate = this.getDestroyRate(star)
            const failRate = 10000 - successRate - destroyRate
            const stat = new StarforceStat(star, successRate, destroyRate, failRate)
            this.stats.push(stat)

            const catchSuccessRate = this.getCatchSuccessRate(star)
            const catchDestroyRate = this.getCatchDestroyRate(star)
            const catchfailRate = 10000 - catchSuccessRate - catchDestroyRate
            const catchStat = new StarforceStat(star, catchSuccessRate, catchDestroyRate, catchfailRate)
            this.catchStats.push(catchStat)

            const totalStat = new TotalStat(star, successRate, destroyRate, failRate)
            this.totalStats.push(totalStat)
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

    getCatchSuccessRate(star) {
        if (star <= 2) return 9975 - 525 * star
        if (star <= 13) return 10500 - 525 * star
        if (star <= 21) return 3150
        return 2625 - 105 * star
    }

    getCatchDestroyRate(star) {
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

    getCatchSuccessRate(star) {
        if (star <= 1) return 5250
        if (star == 2) return 4725
        if (star <= 8) return 4200
        if (star == 9) return 3885
        if (star <= 11) return 3675
        return 1575 - 105 * star
    }

    getCatchDestroyRate(star) {
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

const starforceResults = [new NormalResult(), new SuperiorResult()]

const starforceTbody = document.getElementById('starforce_tbody')

function refreshTable() {
    const hideEmptyRow = document.getElementById('hide_empty_row').checked
    const hideLowStar = document.getElementById('hide_low_star').checked
    const onlyShowProb = document.getElementById('only_show_prob').checked
    const superiorOn = document.getElementById('superior_on').checked
    const catchTotal = document.getElementById('catch_total').checked
    const catchOn = document.getElementById('catch_on').checked
    const catchOff = document.getElementById('catch_off').checked

    let result = starforceResults[0]
    if (superiorOn) result = starforceResults[1]

    let stats = result.totalStats
    if (catchOn) stats = result.catchStats
    if (catchOff) stats = result.stats

    let innerHTML = ''

    stats.forEach((stat) => {
        if (hideEmptyRow && stat.totalObserved == 0) return

        if (hideLowStar && !superiorOn && stat.star < 15) return

        innerHTML += '<tr>'

        innerHTML += '<td>' + stat.star + ' -> ' + (stat.star + 1) + '</td>';
        innerHTML += '<td>' + stat.totalObserved + '</td>'

        for (const [rate, observed] of [[stat.successRate, stat.successObserved],
        [stat.failRate, stat.failObserved], [stat.destroyRate, stat.destroyObserved]]) {
            innerHTML += '<td>'
            innerHTML += (rate / 100).toFixed(2) + '%'
            if (!onlyShowProb && stat.totalObserved != 0) innerHTML += ' , ' + (rate * stat.totalObserved / 10000).toFixed(2) + '회'
            innerHTML += '</td>'

            innerHTML += '<td>'
            if (stat.totalObserved != 0) {
                innerHTML += (observed / stat.totalObserved * 100).toFixed(2) + '%'
                if (!onlyShowProb && stat.totalObserved != 0) innerHTML += ' , '
                if (!onlyShowProb) innerHTML += observed + '회'
            }
            innerHTML += '</td>'
        }

        innerHTML += '</tr>'
    })

    starforceTbody.innerHTML = ''
    starforceTbody.insertAdjacentHTML('afterbegin', innerHTML)
}

const apiUrlBase = 'https://open.api.nexon.com/maplestory/v1/history/starforce?count=1000&date='

let datas = []

function processData(target_item = '') {
    starforceResults[0] = new NormalResult()
    starforceResults[1] = new SuperiorResult()

    for (const data of datas) {
        for (const history of Object.values(data.starforce_history)) {
            console.log(history)
            if (target_item != '' && history.target_item.match(target_item) == null) continue

            if (history.chance_time == '찬스타임 적용') continue

            if (history.destroy_defence == '파괴 방지 적용') continue

            const star = history.before_starforce_count

            if (history.superior_item_flag != '슈페리얼 장비'
                && history.starforce_event_list != null
                && (star == 5 || star == 10 || star == 15)) continue

            let result = starforceResults[0]
            if (history.superior_item_flag == '슈페리얼 장비') result = starforceResults[1]

            let stat = result.stats[star]
            if (history.starcatch_result == '성공') stat = result.catchStats[star]

            const totalStat = result.totalStats[star]

            stat.totalObserved += 1
            totalStat.totalObserved += 1

            totalStat.addSuccessRate(stat.successRate)
            totalStat.addFailRate(stat.failRate)
            totalStat.addDestroyRate(stat.destroyRate)

            if (history.item_upgrade_result == '성공') {
                stat.successObserved += 1
                totalStat.successObserved += 1
            } else if (history.item_upgrade_result == '실패(유지)' ||
                history.item_upgrade_result == '실패(하락)') {
                stat.failObserved += 1
                totalStat.failObserved += 1
            } else {
                stat.destroyObserved += 1
                totalStat.destroyObserved += 1
            }
        }
    }

    refreshTable()
}

async function getStarforceData(apiKey, date) {
    const apiUrl = apiUrlBase + date

    fetch(apiUrl, {
        headers: {
            'x-nxopen-api-key': apiKey
        }
    })
        .then(response => response.json())
        .then(data => {
            datas.push(data)
        })
        .catch(error => {
            console.log(error)
        })
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function getAllStarforceData() {
    const getDataButton = document.getElementById('get_data_button')
    getDataButton.disabled = true

    const dateBeginText = document.getElementById('date_begin_text')
    const dateEndText = document.getElementById('date_end_text')

    const dateBegin = new Date(dateBeginText.value)
    let dateEnd = new Date(dateEndText.value)

    if (isNaN(dateBegin)) {
        alert('시작일에 올바른 날짜를 입력해주세요.\n(ex. 2023-12-27)')
        getDataButton.disabled = false
        return
    }

    if (isNaN(dateEnd)) {
        alert('종료일에 올바른 날짜를 입력해주세요.\n(ex. 2024-01-10)')
        getDataButton.disabled = false
        return
    }

    const currentDate = new Date()
    currentDate.setHours(9)

    if (dateEnd > currentDate) {
        dateEnd = currentDate
        dateEndText.value = dateEnd.toISOString().slice(0, 10)
    }

    if (dateBegin < new Date('2023-12-27')) {
        alert('시작일에 2023-12-27 이후의 날짜를 입력해주세요.')
        getDataButton.disabled = false
        return
    }

    if (dateBegin > dateEnd) {
        alert('종료일이 시작일보다 이릅니다.')
        getDataButton.disabled = false
        return
    }

    const apiKey = document.getElementById('api_key_text').value

    if (apiKey == '') {
        alert('API Key를 입력하세요.\nhttps://openapi.nexon.com/my-application/ 에서 발급받을 수 있습니다.')
        getDataButton.disabled = false
        return
    }

    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    document.cookie = 'apiKey=' + apiKey + '; expires=' + expirationDate.toUTCString()

    datas = []

    for (const date = dateBegin; date <= dateEnd; date.setDate(date.getDate() + 1)) {
        const paramDate = date.toISOString().slice(0, 10)

        await getStarforceData(apiKey, paramDate)

        await sleep(200)
    }

    processData()

    getDataButton.disabled = false
}

function resetSearchText() {
    document.getElementById('search_text').value = ''
    processData()
}

function search() {
    const itemName = document.getElementById('search_text').value
    processData(itemName)
}

function getCookieValue(name) {
    const regex = new RegExp(`(^| )${name}=([^;]+)`)
    const match = document.cookie.match(regex)

    if (match) return match[2]

    return null
}

window.onload = () => {
    const apiKey = getCookieValue('apiKey')
    if (apiKey) document.getElementById('api_key_text').value = apiKey

    const currentDate = new Date()
    currentDate.setHours(9)
    document.getElementById('date_end_text').value = currentDate.toISOString().slice(0, 10)

    refreshTable()
}