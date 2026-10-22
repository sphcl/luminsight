// Roda antes da primeira pintura pra não piscar o tema errado; é arquivo e não inline pra CSP não precisar de hash.
// Mesmas chaves e valores de src/features/preferences/preferences.ts.
;(function () {
  var root = document.documentElement
  var theme = null
  var fontSize = null
  try {
    theme = window.localStorage.getItem('luminsight:theme')
    fontSize = window.localStorage.getItem('luminsight:font-size')
  } catch (error) {
    theme = null
  }
  if (theme !== 'light' && theme !== 'dark') {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    theme = prefersDark ? 'dark' : 'light'
  }
  if (theme === 'dark') root.classList.add('dark')
  var scales = { lg: '1.15', xl: '1.3' }
  if (fontSize === 'lg' || fontSize === 'xl') {
    root.setAttribute('data-font-size', fontSize)
    root.style.setProperty('--reading-scale', scales[fontSize])
  }
})()
