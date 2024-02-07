const initialDateString = '2023-12-27';

const getDataButtonString = 'get_data_button';
const beginDateTextString = 'begin_date_text';
const endDateTextString = 'end_date_text';
const apiKeyTextString = 'api_key_text';
const getDataResultString = 'get_data_result';

const invalidBeginDateErrorName = 'InvalidBeginDateError';
const invalidEndDateErrorName = 'InvalidEndDateError';
const endDateBeforeBeginDateErrorName = 'EndDateBeforeBeginDateError';
const emptyApiKeyErrorName = 'EmptyApiKeyError';
const badRequestErrorName = 'BadRequestError';
const tooManyRequestsErrorName = 'TooManyRequestsError';
const internalServerErrorName = 'InternalServerError';

const unknownErrorMessage = '오류가 발생했습니다.';
const invalidBeginDateErrorMessage = `시작일에 올바른 날짜를 입력해주세요.\n(ex. 2023-12-27)`;
const invalidEndDateErrorMessage = '종료일에 올바른 날짜를 입력해주세요.\n(ex. 2024-01-10)';
const endDateBeforeBeginDateErrorMessage = '종료일이 시작일보다 이릅니다.';
const emptyApiKeyErrorMessage = 'API Key를 입력해주세요.\n(도움말 참조)';
const badRequestErrorMessage = 'API Key가 잘못되었습니다.\n(도움말 참조)';
const internalServerErrorMessage = '서버 내부 오류가 발생했습니다.';
const tooManyRequestsErrorMessage = '너무 많은 요청을 보냈습니다.\nAPI 상태를 확인해주세요.';

const apiBaseUrl = 'https://open.api.nexon.com/maplestory/v1/history/starforce?count=1000&';

const normalSuccessRates = [
    9500, 9000, 8500, 8500, 8000,
    7500, 7000, 6500, 6000, 5500,
    5000, 4500, 4000, 3500, 3000,
    3000, 3000, 3000, 3000, 3000,
    3000, 3000, 300, 200, 100
]

const normalDestroyRates = [
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    210, 210, 210, 280, 280,
    700, 700, 1940, 2940, 3960
]

const superiorSuccessRates = [
    50, 50, 45, 40, 40,
    40, 40, 40, 40, 37,
    35, 35, 3, 2, 1
]

const superiorDestroyRates = [
    0, 0, 0, 0, 0,
    180, 300, 420, 600, 950,
    1300, 1630, 4850, 4900, 4950
]

let answers = [];

function getDates() {
    const beginDateText = document.getElementById(beginDateTextString);
    const endDateText = document.getElementById(endDateTextString);

    let beginDate = new Date(beginDateText.value);
    let endDate = new Date(endDateText.value);

    if (isNaN(beginDate)) {
        throw new Error(invalidBeginDateErrorName);
    }

    if (isNaN(endDate)) {
        throw new Error(invalidEndDateErrorName);
    }

    if (beginDate < new Date(initialDateString)) {
        beginDateText.value = initialDateString;
        beginDate = new Date(initialDateString);
    }

    const currentDate = new Date();
    currentDate.setHours(9);

    if (endDate > currentDate) {
        endDateText.value = currentDate.toISOString().slice(0, 10);
        endDate = currentDate;
    }

    if (beginDate > endDate) {
        throw new Error(endDateBeforeBeginDateErrorName);
    }

    return [beginDate, endDate];
}

function getErrorMessage(error) {
    if (error.message === invalidBeginDateErrorName) {
        return invalidBeginDateErrorMessage;
    }

    if (error.message === invalidEndDateErrorName) {
        return invalidEndDateErrorMessage;
    }

    if (error.message === endDateBeforeBeginDateErrorName) {
        return endDateBeforeBeginDateErrorMessage;
    }

    if (error.message === emptyApiKeyErrorName) {
        return emptyApiKeyErrorMessage;
    }

    if (error.message === badRequestErrorName) {
        return badRequestErrorMessage;
    }

    if (error.message === internalServerErrorName) {
        return internalServerErrorMessage;
    }

    return `${unknownErrorMessage}\n${error.message}`;
}

function getApiKey() {
    const apiKey = document.getElementById(apiKeyTextString).value;

    if (!apiKey) throw new Error(emptyApiKeyErrorName);

    return apiKey;
}

async function fetchData(apiKey, apiUrl) {
    const response = await fetch(apiUrl, {
        headers: {
            'x-nxopen-api-key': apiKey
        }
    });

    if (response.status === 400) {
        throw new Error(badRequestErrorName);
    }

    if (response.status === 429) {
        throw new Error(tooManyRequestsErrorName);
    }

    if (response.status === 500) {
        throw new Error(internalServerErrorName);
    }

    if (!response.ok) {
        throw new Error(`response.status = ${response.status}`);
    }

    return await response.json();
}

function sleep(time) {
    return new Promise(r => setTimeout(r, time));
}

function getSuccessRate(star, isNormal, isCatch, events) {
    let successRate = isNormal ? normalSuccessRates[star] : superiorSuccessRates[star];

    if (isCatch) successRate *= 1.05;

    return successRate;
}

class StarforceStat {
    constructor(star) {
        this.star = star;
        this.count = 0;
        this.totalSuccessRates = 0;
        this.totalDestroyRates = 0;
        this.totalFailRates = 0;
        this.successCount = 0;
        this.destroyCount = 0;
        this.failCount = 0;
    }
}

class StarforceResult {
    constructor() {
        this.normalStats = [];

        for (const star of Array(25).keys()) {
            const stat = new StarforceStat(star);
            this.normalStats.push(stat);
        }

        this.superiorStats = [];

        for (const star of Array(15).keys()) {
            const stat = new StarforceStat(star);
            this.superiorStats.push(stat);
        }
    }
}

function refreshTable(starforceResult) {
    for (const s of starforceResult.normalStats) {
        console.log(s.totalSuccessRates / s.successCount);
    }
}

function processData() {
    const starforceResult = new StarforceResult();

    for (const answer of answers) {
        for (const history of answer.starforce_history) {
            const isNormal = history.superior_item_flag !== '슈페리얼 장비';
            const star = history.before_starforce_count;
            const result = history.item_upgrade_result;
            const isCatch = history.starcatch_result === '성공';
            const events = history.starforce_event_list;

            for (const event of history.starforce_event_list) {
                
            }

            const stats = isNormal ? starforceResult.normalStats : starforceResult.superiorStats;
            const stat = stats[star];
            stat.count++;

            if (result === '성공') {
                stat.successCount++;
                stat.totalSuccessRates += getSuccessRate(star, isNormal, isCatch, events);
            } else if (result === '파괴') {
                stat.destroyCount++;
                // stat.totalDestroyRates += getDestroyRate(star, isNormal, isCatch, events);
            } else {
                stat.failCount++;
            }
        }
    }

    refreshTable(starforceResult);
}

async function getData() {
    const getDataButton = document.getElementById(getDataButtonString);
    getDataButton.disabled = true;


    // 시작일, 종료일 불러오기
    let beginDate = null;
    let endDate = null;

    try {
        [beginDate, endDate] = getDates();
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        alert(errorMessage);
        getDataButton.disabled = false;
        return;
    };


    // api key 불러오기
    let apiKey = null;

    try {
        apiKey = getApiKey();
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        alert(errorMessage);
        getDataButton.disabled = false;
        return;
    }


    // 스택에 호출할 url 삽입
    const apiUrlStack = [];

    for (const date = beginDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateParam = date.toISOString().slice(0, 10);
        const apiUrl = `${apiBaseUrl}date=${dateParam}`;
        apiUrlStack.push(apiUrl);
    }


    // 스택에서 하나씩 fetch
    let counts = 0;
    let failed = false;

    answers.length = 0;

    while (apiUrlStack.length) {
        const apiUrl = apiUrlStack.pop();
        let answer = null;

        try {
            answer = await fetchData(apiKey, apiUrl);

            counts += answer.count;
            answers.push(answer);

            if (answer.next_cursor) {
                const url = `${apiBaseUrl}cursor=${answer.next_cursor}`;
                apiUrlStack.push(url);
            }

            failed = false;
        } catch (error) {
            // too many requests 발생 시 5초 후 재시도
            // 2번 연속 실패 시 예외 발생
            if (error.message === tooManyRequestsErrorName) {
                if (failed) {
                    alert(tooManyRequestsErrorMessage);
                    getDataButton.disabled = false;
                    return;
                }

                failed = true;
                apiUrlStack.push(apiUrl);
                await sleep(5000);
                continue;
            }

            const errorMessage = getErrorMessage(error);
            alert(errorMessage);
            getDataButton.disabled = false;
            return;
        }
    }

    const getDataResult = document.getElementById(getDataResultString);
    getDataResult.innerHTML = `${counts}개의 기록을 불러왔습니다.`;

    processData();

    getDataButton.disabled = false;
}

function handleCheckbox(source) {
    for (const checkbox of document.getElementsByName(source.name)) {
        if (checkbox === source) continue;
        checkbox.checked = source.checked;
    }

    processData();
}

function init() {
    const currentDate = new Date();
    currentDate.setHours(9);

    const endDateText = document.getElementById(endDateTextString);
    endDateText.value = currentDate.toISOString().slice(0, 10);
}

init();