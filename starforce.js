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

const starforces = []

for (const x of Array(25).keys()) {
    starforces.push(new Starforce(x));
}

const starforce_tbody = document.getElementById('starforce_tbody')

function refresh_table() {
    starforce_tbody.innerHTML = '';

    const show_zero_row = document.getElementById('show_zero_row').checked

    starforces.slice().reverse().forEach((starforce) => {
        if (!show_zero_row && starforce.count == 0) return

        let row = '<tr align="center">'
        row += '<td>' + starforce.star + ' -> ' + (starforce.star + 1) + '</td>';
        row += '<td>' + starforce.count + '</td>'

        row += '<td>' + starforce.success_rate.toFixed(2) + '% , ' + (starforce.count * starforce.success_rate / 100).toFixed(2) + '회' + '</td>'
        row += '<td>' + (starforce.success_observed / starforce.count * 100).toFixed(2) + '% , ' + starforce.success_observed + '회' + '</td>'

        row += '<td>' + starforce.fail_rate.toFixed(2) + '% , ' + (starforce.count * starforce.fail_rate / 100).toFixed(2) + '회' + '</td>'
        row += '<td>' + (starforce.fail_observed / starforce.count * 100).toFixed(2) + '% , ' + starforce.fail_observed + '회' + '</td>'

        row += '<td>' + starforce.destory_rate.toFixed(2) + '% , ' + (starforce.count * starforce.destory_rate / 100).toFixed(2) + '회' + '</td>'
        row += '<td>' + (starforce.destory_observed / starforce.count * 100).toFixed(2) + '% , ' + starforce.destory_observed + '회' + '</td>'

        row += '</tr>'

        starforce_tbody.insertAdjacentHTML('afterend', row)
    })
}

const api_url = 'https://open.api.nexon.com/maplestory/v1/history/starforce?count=10&date=2024-01-04'

function call_api() {
    fetch(api_url, {
        headers: {
            'x-nxopen-api-key': API_KEY
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

                console.log(history);
            }

            refresh_table()
        })
        .catch(error => console.error(error))
}