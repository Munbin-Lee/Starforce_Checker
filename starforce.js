function get_success_rate(star) {
    if (star <= 2) return 95 - 5 * star
    if (star <= 14) return 100 - 5 * star
    if (star <= 21) return 30
    return 25 - star
}

function get_destroy_rate(star) {
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
        this.success_rate = get_success_rate(star)
        this.success_observed = 0
        this.destory_rate = get_destroy_rate(star)
        this.destory_observed = 0
        this.fail_rate = 100 - get_success_rate(star) - get_destroy_rate(star)
        this.fail_observed = 0
    }
}

let starforces = []

const starforce_tbody = document.getElementById('starforce_tbody')

function refresh_table() {
    starforce_tbody.innerHTML = ''

    const show_zero_row = document.getElementById('show_zero_row').checked
    const show_only_prob = document.getElementById('show_only_prob').checked

    let innerHTML = ''

    starforces.forEach((starforce) => {
        if (!show_zero_row && starforce.count == 0) return

        innerHTML += '<tr align="center">'

        innerHTML += '<td>' + starforce.star + ' -> ' + (starforce.star + 1) + '</td>';
        innerHTML += '<td>' + starforce.count + '</td>'

        innerHTML += '<td>' + starforce.success_rate.toFixed(2) + '%'
        if (!show_only_prob) innerHTML += ' , ' + (starforce.count * starforce.success_rate / 100).toFixed(2) + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + (starforce.success_observed / starforce.count * 100).toFixed(2) + '%'
        if (!show_only_prob) innerHTML += ' , ' + starforce.success_observed + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + starforce.fail_rate.toFixed(2) + '%'
        if (!show_only_prob) innerHTML += ' , ' + (starforce.count * starforce.fail_rate / 100).toFixed(2) + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + (starforce.fail_observed / starforce.count * 100).toFixed(2) + '%'
        if (!show_only_prob) innerHTML += ' , ' + starforce.fail_observed + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + starforce.destory_rate.toFixed(2) + '%'
        if (!show_only_prob) innerHTML += ' , ' + (starforce.count * starforce.destory_rate / 100).toFixed(2) + '회'
        innerHTML += '</td>'

        innerHTML += '<td>' + (starforce.destory_observed / starforce.count * 100).toFixed(2) + '%'
        if (!show_only_prob) innerHTML += ' , ' + starforce.destory_observed + '회'
        innerHTML += '</td>'

        innerHTML += '</tr>'


    })

    starforce_tbody.insertAdjacentHTML('afterbegin', innerHTML)
}

const api_url = 'https://open.api.nexon.com/maplestory/v1/history/starforce?count=10&date=2024-01-04'

function call_api() {
    const api_key = document.getElementById('api_key_text').value

    fetch(api_url, {
        headers: {
            'x-nxopen-api-key': api_key
        }
    })
        .then(response => response.json())
        .then(data => {
            starforces = []

            for (const x of Array(25).keys()) {
                starforces.push(new Starforce(x));
            }

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

                console.log(history);
            }

            refresh_table()
        })
        .catch(error => {
            alert("API KEY가 잘못되었습니다.")
        })
}