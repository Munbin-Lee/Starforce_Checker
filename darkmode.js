let isDark = false

function getCookieValue2(name) {
    const regex = new RegExp(`(^| )${name}=([^;]+)`)
    const match = document.cookie.match(regex)

    if (match) return match[2]

    return null
}

cookie = getCookieValue2('isDark')

if (cookie == 'true' || (cookie == null) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark = true
    document.body.classList.add('dark')
    document.getElementById('dark_mode_button').value = '라이트모드'
}

function flipColorMode() {
    const body = document.body
    const darkModeButton = document.getElementById('dark_mode_button')

    if (isDark) {
        isDark = false;
        body.classList.remove('dark')
        darkModeButton.value = '다크모드'
    } else {
        isDark = true;
        body.classList.add('dark')
        darkModeButton.value = '라이트모드'
    }

    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    document.cookie = 'isDark=' + isDark + '; expires=' + expirationDate.toUTCString()
}