import domready from 'domready'
import React from 'react'
import ReactDOM from 'react-dom'
import './app.scss'
import Calendar from './Calendar'
import Images from './Images'

import 'bootstrap/js/dist/modal'
import 'bootstrap/js/dist/scrollspy'

domready(() => {
  ReactDOM.render(<Images />, document.getElementById('smaabruket-images'))

  ReactDOM.render(<Calendar />, document.getElementById('smaabruket-calendar'))
})
