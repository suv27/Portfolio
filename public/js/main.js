let showMenu = false;

$(document).ready(() => {

  // const menuBtn = document.querySelector('.menu-btn');
  // const menu = document.querySelector('.menu');
  // const manuNav = document.querySelector('.menu-nav');
  // const menuBtn = document.querySelector('menu-btn');

  // SETTING THE INITIAL STATE OF THE MENU
  $('.menu-btn').on('click', toggleMenu);

});

toggleCurrent = () => {
  let base = 'http://localhost:4000';
  jQuery.address.change((event) => {
    if (event.value) {

      // remove active class on all nav links
      $('.nav-item').removeClass('current');

      // get current link and add active class to it
      $('.nav-item a').each(() => {
        var dataPath = jQuery(this).attr('href').replace(base, '');
        $(this).attr('data-path', dataPath);
        if (dataPath == (event.value)) {
          $(this).addClass('current');
        }
      });
    }
  });
};

toggleMenu = () => {
  if (!showMenu) {
    $('.menu-btn').addClass('close');
    $('.menu').addClass('show');
    $('.menu-nav').addClass('show');
    $('.menu-branding').addClass('show');
    $('.nav-item').addClass('show');

    // SET MENU STATE
    showMenu = true;

  } else {
    $('.menu-btn').removeClass('close');
    $('.menu').removeClass('show');
    $('.menu-nav').removeClass('show');
    $('.menu-branding').removeClass('show');
    $('.nav-item').removeClass('show');

    // SET MENU STATE
    showMenu = false;
  }
};

//
// const menuBtn = document.querySelector('.menu-btn');
// const menu = document.querySelector('.menu');
// const manuNav = document.querySelector('.menu-nav');
// const menuBranding = document.querySelector('.menu-branding');
// const navItems = document.querySelectorAll('.nav-item');
//
// // SETTING THE INITIAL STATE OF THE MENU
// let showMenu = false;
// menuBtn.on('click', toggleMenu());
//
// function() {
//   if (!showMenu) {
//     menuBtn.classList.add('close');
//     menu.classList.add('show');
//     manuNav.classList.add('show');
//     menuBranding.classList.add('show');
//     navItems.each(item => item.classList.add('show'));
//
//     // SET MENU STATE
//     showMenu = true;
//
//   } else {
//     menuBtn.classList.remove('close');
//     menu.classList.remove('show');
//     manuNav.classList.remove('show');
//     menuBranding.classList.remove('show');
//     navItems.each(item => item.classList.remove('show'));
//
//     // SET MENU STATE
//     showMenu = false;
//   }
// }
