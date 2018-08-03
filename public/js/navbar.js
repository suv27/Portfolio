$(document).ready(() => {
  $('.hamburger-btn .fa-times').hide();

  $('.hamburger-btn .fa-bars').on('click', () => {
    $('.hamburger-btn .fa-bars').hide();
    $('.hamburger-btn .fa-times').show();
    $('.nav-mob .navbar-mob').addClass('active');
  });

  $('.hamburger-btn .fa-times').on('click', () => {
    $('.hamburger-btn .fa-times').hide();
    $('.hamburger-btn .fa-bars').show();
    $('.nav-mob .navbar-mob').removeClass('active');
  });

});
