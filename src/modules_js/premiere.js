
import {openBuyForm} from './buy_ticket.js';

/* 
document.addEventListener('DOMContentLoaded', async () => {

const premiere_slider = document.querySelector('.premiere_slider');
if(premiere_slider) getSliderVisible(premiere_slider.children);

function getSliderVisible(obj) {
const premiere_slider_prev = premiere_slider.nextElementSibling.querySelector('.premiere_slider_prev');
const premiere_slider_next = premiere_slider.nextElementSibling.querySelector('.premiere_slider_next');
  let i = 0;
  let j = null;
  let pauseSlider = false;

  function installPauseOnSlider() {
    if (!pauseSlider) {
      pauseSlider = true;
      const elems = document.querySelectorAll('.centered');
      elems.forEach((el) => el.classList.remove('centered'));
      this.classList.add('centered');
    }
  }

  function unInstallPauseOnSlider() {
    if (pauseSlider) {
      this.classList.remove('centered');
      pauseSlider = false;
      showSlides();
    }
  }

  function showSlides() {
    if (j !== null) obj[j].classList.remove('centered');
    let arr = Array.from(obj).slice(i, i + 3);
    arr.forEach(el => {
      el.classList.remove("unblock");
      el.addEventListener('mouseenter', installPauseOnSlider);
      el.addEventListener('mouseleave', unInstallPauseOnSlider);
    });
    let centerIndex = Math.floor(arr.length / 2);
    arr[centerIndex].classList.add('centered');
  }

  function hideSlides(arr, next_el_visible = true) {
    arr.forEach(el => {
      el.classList.add("unblock");
      el.removeEventListener('mouseenter', installPauseOnSlider);
      el.removeEventListener('mouseleave', unInstallPauseOnSlider);
    });
    j = i + 1;
    if (next_el_visible) {
      ((i + 1) % (obj.length - 1) <= obj.length - 3) ? (i = (i + 1) % (obj.length - 1)) : (i = 0);
    } else {
      if (i > 0) { i-- }
      else { i = obj.length - 3; }
    }
    showSlides();
  }

  setInterval(function () {
    if (!pauseSlider) hideSlides(Array.from(obj).slice(i, i + 3));
  }, 8000);
  showSlides();

  function getNextSlider() {
    pauseSlider = true;
    hideSlides(Array.from(obj).slice(i, i + 3));
  }

  function getPrevSlider() {
    pauseSlider = true;
    if (i > 0) {
      i--;
      let view = document.querySelectorAll('.premiere_slider_item:not(.unblock)');
      view.forEach((el) => el.classList.remove('centered'));
      view[0].previousElementSibling.classList.remove('unblock');
      view[2].classList.add('unblock');
      view = document.querySelectorAll('.premiere_slider_item:not(.unblock)');
      view[1].classList.add('centered');
    }
    hideSlides(Array.from(obj).slice(i, i + 3), false);
  }
  premiere_slider_next.addEventListener('click', getNextSlider);
  premiere_slider_prev.addEventListener('click', getPrevSlider);
}

if(premiere_slider) {
  premiere_slider.addEventListener('click', async function(e) {
    if(e.target.classList.contains('premiere_slider_item_btn')) {
      const movie_name = e.target.parentElement.parentElement.querySelector('.premiere_slider_item_name');
      openBuyForm({movie_name: movie_name});
    }
  });

}


});


 */

document.addEventListener('DOMContentLoaded', async () => {

  const premiere_slider = document.querySelector('.premiere_slider');
  if (premiere_slider) getSliderVisible(premiere_slider.children);

  function getSliderVisible(obj) {
    const premiere_slider_prev = premiere_slider.nextElementSibling.querySelector('.premiere_slider_prev');
    const premiere_slider_next = premiere_slider.nextElementSibling.querySelector('.premiere_slider_next');
    let i = 0;
    let j = null;
    let pauseSlider = false;

    if (window.innerWidth > 360) {
      function installPauseOnSlider() {
        if (!pauseSlider) {
          pauseSlider = true;
          const elems = document.querySelectorAll('.centered');
          elems.forEach((el) => el.classList.remove('centered'));
          this.classList.add('centered');
        }
      }
  
      function unInstallPauseOnSlider() {
        if (pauseSlider) {
          this.classList.remove('centered');
          pauseSlider = false;
          showSlides();
        }
      }
  
      function showSlides() {
        if (j !== null) obj[j].classList.remove('centered');
        let arr = Array.from(obj).slice(i, i + 3);
        arr.forEach(el => {
          el.classList.remove("unblock");
          el.addEventListener('mouseenter', installPauseOnSlider);
          el.addEventListener('mouseleave', unInstallPauseOnSlider);
        });
        let centerIndex = Math.floor(arr.length / 2);
        arr[centerIndex].classList.add('centered');
      }
  
      function hideSlides(arr, next_el_visible = true) {
        arr.forEach(el => {
          el.classList.add("unblock");
          el.removeEventListener('mouseenter', installPauseOnSlider);
          el.removeEventListener('mouseleave', unInstallPauseOnSlider);
        });
        j = i + 1;
        if (next_el_visible) {
          ((i + 1) % (obj.length - 1) <= obj.length - 3) ? (i = (i + 1) % (obj.length - 1)) : (i = 0);
        } else {
          if (i > 0) { i-- }
          else { i = obj.length - 3; }
        }
        showSlides();
      }
  
      setInterval(function () {
        if (!pauseSlider) hideSlides(Array.from(obj).slice(i, i + 3));
      }, 8000);
      showSlides();
  
      function getNextSlider() {
        pauseSlider = true;
        hideSlides(Array.from(obj).slice(i, i + 3));
      }
  
      function getPrevSlider() {
        pauseSlider = true;
        if (i > 0) {
          i--;
          let view = document.querySelectorAll('.premiere_slider_item:not(.unblock)');
          view.forEach((el) => el.classList.remove('centered'));
          view[0].previousElementSibling.classList.remove('unblock');
          view[2].classList.add('unblock');
          view = document.querySelectorAll('.premiere_slider_item:not(.unblock)');
          view[1].classList.add('centered');
        }
        hideSlides(Array.from(obj).slice(i, i + 3), false);
      }
      premiere_slider_next.addEventListener('click', getNextSlider);
      premiere_slider_prev.addEventListener('click', getPrevSlider);
    }

    if (window.innerWidth <= 360) {
      function installPauseOnSlider() {
        if (!pauseSlider) {
          pauseSlider = true;
          const elems = document.querySelectorAll('.centered');
          elems.forEach((el) => el.classList.remove('centered'));
          this.classList.add('centered');
        }
      }
  
      function unInstallPauseOnSlider() {
        if (pauseSlider) {
          this.classList.remove('centered');
          pauseSlider = false;
          showSlides();
        }
      }
  
      function showSlides() {
        if (j !== null) obj[j].classList.remove('centered');
        let arr = Array.from(obj).slice(i, i + 1);
        arr[0].classList.remove("unblock");
        arr[0].classList.add('centered');
        arr[0].addEventListener('mouseenter', installPauseOnSlider);
        arr[0].addEventListener('mouseleave', unInstallPauseOnSlider);
      }
  
      function hideSlides(arr, this_el_visible = true) {
        arr.forEach(el => {
          el.classList.add("unblock");
          el.removeEventListener('mouseenter', installPauseOnSlider);
          el.removeEventListener('mouseleave', unInstallPauseOnSlider);
        });
        j = i;
        i+=1;
        showSlides();
      }
  
      setInterval(function () {
        if (!pauseSlider) hideSlides(Array.from(obj).slice(i, i + 1));
      }, 8000);
      showSlides();
  
      function getNextSlider() {
        pauseSlider = true;
        hideSlides(Array.from(obj).slice(i, i + 1));
      }
  
      function getPrevSlider() {
        pauseSlider = true;
        if (i > 0) {
          i--;
          let view = document.querySelectorAll('.premiere_slider_item:not(.unblock)');
          view.forEach((el) => el.classList.remove('centered'));
          view[0].previousElementSibling.classList.remove('unblock');
      /*     view[2].classList.add('unblock'); */
          view = document.querySelectorAll('.premiere_slider_item:not(.unblock)');
          view[0].previousElementSibling.classList.add('centered');
        }
        hideSlides(Array.from(obj).slice(i, i + 1), false);
      }
      premiere_slider_next.addEventListener('click', getNextSlider);
      premiere_slider_prev.addEventListener('click', getPrevSlider);
    }


  }

  if (premiere_slider) {
    premiere_slider.addEventListener('click', async function (e) {
      if (e.target.classList.contains('premiere_slider_item_btn')) {
        const movie_name = e.target.parentElement.parentElement.querySelector('.premiere_slider_item_name');
        openBuyForm({ movie_name: movie_name });
      }
    });
  }

});



  











/*   // Медиазапрос для разрешения экрана 360px
  if (window.innerWidth <= 360) {
    // Прокручиваем только один слайд
    const premiere_slider_items = premiere_slider.querySelectorAll('.premiere_slider_item');
    
    premiere_slider_items.forEach((item, index) => {
      if (index > 0) {
        item.style.display = 'none'; // скрываем все элементы, кроме первого
        item.classList.remove('centered'); // убираем класс centered с остальных слайдов
      } else {
        item.classList.add('centered'); // добавляем класс centered на первый слайд
      }
    });
  
    // Обработчики для кнопок слайдера (если они существуют)
    const premiere_slider_next = premiere_slider.nextElementSibling.querySelector('.premiere_slider_next');
    const premiere_slider_prev = premiere_slider.nextElementSibling.querySelector('.premiere_slider_prev');
  
    if (premiere_slider_next && premiere_slider_prev) {
      premiere_slider_next.addEventListener('click', function () {
        // Переключаем только один слайд
        premiere_slider_items.forEach((item, index) => {
          if (index === 0) {
            item.style.display = 'none'; // скрываем первый слайд
            item.classList.remove('centered'); // убираем класс centered с первого слайда
          }
          if (index === 1) {
            item.style.display = 'block'; // показываем следующий слайд
            item.classList.add('centered'); // добавляем класс centered на следующий слайд
          }
        });
      });
  
      premiere_slider_prev.addEventListener('click', function () {
        // Переключаем только один слайд в обратную сторону
        premiere_slider_items.forEach((item, index) => {
          if (index === 0) {
            item.style.display = 'block'; // показываем первый слайд
            item.classList.add('centered'); // добавляем класс centered на первый слайд
          }
          if (index === 1) {
            item.style.display = 'none'; // скрываем следующий слайд
            item.classList.remove('centered'); // убираем класс centered с этого слайда
          }
        });
      });
    }
  } */