/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./modules_js/header.js
const menu_main_list = document.querySelector('.menu_main_list');
const entrance_form_btn = document.querySelector('.entrance_form_btn');
const contacts = document.querySelector('.contacts');

Array.from(menu_main_list.children).forEach(el => {
  let li_child = el.querySelector('ul');
  if (li_child) {
    el.addEventListener('mouseover', () => {
      li_child.classList.toggle('visibility');
    })
    el.addEventListener('mouseout', () => {
      li_child.classList.toggle('visibility');
    })
  }
});
;// ./index.js









/* import './modules_css/common.css';
import './modules_css/header.css'; */
/* import hello1 from './modules_js/hello1.js'; 
import hello2 from './modules_js/hello2.js'; */

/******/ })()
;