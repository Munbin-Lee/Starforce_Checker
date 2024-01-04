function get_success_rate(star) {
    if (star <= 2) return 95 - 5 * star
    if (star <= 14) return 100 - 5 * star
    if (star <= 21) return 30
    return 25 - star
}

function get_keep_rate(star) {
    return 0
}

function get_destroy_rate(star) {
    return 0
}

class Starforce {
    constructor(star) {
        this.star = star
        this.count = 0
        this.success_rate = get_success_rate(star)
        this.success_observed = 0
        this.keep_rate = get_keep_rate(star)
        this.keep_observed = 0
        this.destory_rate = get_destroy_rate(star)
        this.destory_observed = 0
    }
}

const starforces = []

for (const x of Array(25).keys()) {
    starforces.push(new Starforce(x));
}

const starforce_tbody = document.getElementById("starforce_tbody")

starforces.slice().reverse().forEach((starforce) => {
    let row = "<tr align='center'>"
    row += "<td>" + starforce.star + " -> " + (starforce.star + 1) + "</td>";
    row += "<td>" + starforce.count + "</td>"
    row += "<td>" + starforce.success_rate.toFixed(2) + "% , " + (starforce.count * starforce.success_rate / 100).toFixed(2) + "회" + "</td>"
    row += "<td>" + (starforce.success_observed / starforce.count).toFixed(2) + "% , " + starforce.success_observed + "회" + "</td>"
    row += "</tr>"

    starforce_tbody.insertAdjacentHTML('afterend', row)
})