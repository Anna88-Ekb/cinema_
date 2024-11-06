/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./modules_js/entrance_worker.js


document.addEventListener('DOMContentLoaded', ()=> {
  const entrance_form_big_container = document.querySelector('.entrance_form_big_container');
  const logo = document.querySelector('.logo');
  logo.style.cssText = `justify-content: center; margin-top: 2rem; color: var(--dark_violet);`;
  logo.children[0].style.cssText = `align-self: center;`;
  entrance_form_big_container.style.backdropFilter = 'sepia(0%)';
  
  const pass = document.querySelector('.password+svg');
  pass.addEventListener('click', ()=> {
    pass.previousElementSibling.type == "text" ? pass.previousElementSibling.type = "password" : pass.previousElementSibling.type = "text";
  })

  
  });
  
;// ./cinema-panel.js









/******/ })()
;