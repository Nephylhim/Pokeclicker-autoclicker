// ==UserScript==
// @name         Pokeclicker auto-clicker
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Add an auto-clicker panel for the game Pokéclicker. It allows you to automatically click on the battle screen while in battle/dojo/dungeon
// @author       Nephylhim
// @match        https://www.pokeclicker.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pokeclicker.com
// @grant        none
// ==/UserScript==

// --- CONFIGURATION VARIABLES
const cpsValues = [0.5, 1, 2, 4, 10, 20, 50, 100, 200]

// --- GLOBAL VARIABLES / NODE ELEMENTS
let isAutoclickerEnabled = false
let cpsIndex = 4 // Used with cpsValues to select the cps (clicks per second) value

let autoclickerInterval // used to setup & clear setInterval
let autoclickerBtn, plusBtn, minusBtn, cpsDiv, statusDiv // DOM elements we need to access to

// --- UTILS FUNCTIONS

function updateACStatusText(status) {
  statusDiv.innerText = 'Auto clicker [' + status + ']'
}

function updateCPSValue() {
  cpsDiv.innerText = cpsValues[cpsIndex]
}

// --- CONTROLLER FUNCTIONS

// Click on the battle screen once.
// TODO: optimize code to avoid searching for the battle div for each click
function battleClick() {
  let divToClick
  try {
    //divToClick = document.getElementsByClassName('battle-view')[0].children[0].children[0]
    divToClick = document.getElementsByClassName('no-gutters clickable')[0]
  } catch (e) {
    console.error('could not find div to click', e)
  }

  if (!!divToClick) {
    divToClick.click()
  } else {
    console.warn('could not click on battle div')
  }
}

// Start the auto clicker
// Can be used to restart the auto clicker too
function startAutoclicker() {
  if (isAutoclickerEnabled) {
    stopAutoclicker()
  }

  isAutoclickerEnabled = true
  updateACStatusText('ON')
  autoclickerBtn.setAttribute('class', 'btn btn-sm btn-success')
  let to = 1000 / cpsValues[cpsIndex] // Convert clicks/s value to timeout between clicks in ms

  autoclickerInterval = setInterval(battleClick, to)
}

// Stop the auto clicker
function stopAutoclicker() {
  isAutoclickerEnabled = false
  // battlerBtn.innerText = 'OFF'
  updateACStatusText('OFF')
  autoclickerBtn.setAttribute('class', 'btn btn-sm btn-danger')

  clearInterval(autoclickerInterval)
}

function toggleAutoclicker() {
  if (isAutoclickerEnabled) {
    stopAutoclicker()
  } else {
    startAutoclicker()
  }
}

// function binded to the "+" autoclicker button
// Increase the value of clicks/s using the cpsValues array
function increaseCPS() {
  // protection against out of bound
  if (cpsIndex >= cpsValues.length - 1) {
    return
  }

  cpsIndex++
  updateCPSValue()

  // if the autoclicker is running, we need to restart it to commit the changes
  if (isAutoclickerEnabled) {
    startAutoclicker()
  }
}

// function binded to the "-" autoclicker button
// Reduce the value of clicks/s using the cpsValues array
function reduceCPS() {
  // protection against out of bound
  if (cpsIndex <= 0) {
    return
  }

  cpsIndex--
  updateCPSValue()

  // if the autoclicker is running, we need to restart it to commit the changes
  if (isAutoclickerEnabled) {
    startAutoclicker()
  }
}

function initAutoclickerPanel() {
  // This is the div that will host our panel
  let battleContainer = document.getElementById('battleContainer')
  if (!battleContainer) {
    console.error(
      'could not init auto clicker panel: battleContainer div not found',
    )
  }

  battleContainer.innerHTML += `
  <div id="autoclicker" class="card-footer p-0" style="display:  flex;">
    <button class="btn btn-sm btn-secondary" id="autoclicker-minus">-</button>
    <button class="btn btn-sm btn-danger" id="autoclicker-toggle">
        <div style="display: flex;flex-direction: column;">
            <div id="autoclicker-status">Auto clicker [OFF]</div>
            <div><b id="autoclicker-cps">4</b> clicks/s</div>
        </div>
    </button>
    <button class="btn btn-sm btn-secondary" id="autoclicker-plus">+</button>
  </div>
  `

  // affect the node elements that we need to use and set the onclick event
  autoclickerBtn = document.getElementById('autoclicker-toggle')
  autoclickerBtn.onclick = toggleAutoclicker
  cpsDiv = document.getElementById('autoclicker-cps')
  statusDiv = document.getElementById('autoclicker-status')
  minusBtn = document.getElementById('autoclicker-minus')
  minusBtn.onclick = reduceCPS
  plusBtn = document.getElementById('autoclicker-plus')
  plusBtn.onclick = increaseCPS

  console.log('autoclicker panel init done')
}

// --- WORKFLOW FUNCTIONS

function waitForElement(elementId, callBack) {
  window.setTimeout(function () {
    let element = document.getElementById(elementId)
    if (element) {
      callBack(elementId, element)
    } else {
      waitForElement(elementId, callBack)
    }
  }, 1000)
}

function init() {
  // Wait for the #battleContainer div to appear before trying to append autoclicker panel
  waitForElement('battleContainer', function () {
    console.log('app initial loading done. Adding autoclicker panel...')
    initAutoclickerPanel()
  })
}

// --- MAIN

;(function () {
  'use strict'

  console.log('Hello there!')
  init()
})()
