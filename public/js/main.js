let showMenu = false;

$(document).ready(() => {

  // SETTING THE INITIAL STATE OF THE MENU
  $('.menu-btn').on('click', toggleMenuHandler);
  menuLinkHandler();
  popUpInfoDiv();

});

menuLinkHandler = () => {

};

toggleMenuHandler = () => {
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

let dictionary = {
  tipCalculator: {
    title: 'Tip<span class="text-secondary"> Calculator<span>',
    miniGif: 'imgs/tip-calculator.gif',
    info: 'Implemented an app using Swift where users can spin on a wheel and depending on the number that lands, either earn or lose points.',
  },
  Notes: {
    title: 'Notes Android App',
    miniGif: 'imgs/to-do-app.gif',
    info: '',
  },
  SlotMachine: {
    title: 'Slot Machine iOS App',
    miniGif: 'imgs/Slot-Machine.gif',
    info: '',
  },
  MLBData: {
    title: 'NodeJS Web App',
    miniGif: 'imgs/MLB.gif',
    info: 'Designed a web app that provides users with the standings of all 30 teams in the Major League, each of their roster and players stats. Using JSON, AJAX and API call all the data are provided.',
  },
  SpaceShip: {
    title: 'Space Ship Game',
    miniGif: 'imgs/spaceship.gif',
    info: 'A still working project, implemented using the object oriented language Java. Aim of the game is for users to shoot asteroids and enemies who will be try to kill the user, gain points to be able to buy life or accessories and try to go through level 1.',
  },
};

popUpInfoDiv = () => {
  $('.tip-calculator-app').on('click', () => {
    $('.projectInfo').css({
      display: 'block',
    });

    const projectTitle = dictionary.tipCalculator.title;
    const projectMinGif = dictionary.tipCalculator.miniGif;
    const projectInfo = dictionary.tipCalculator.info;

    $('.projectInfo img').attr('src', projectMinGif);
    $('.projectInfo .title').html(projectTitle);
    $('.projectInfo .info').html(projectInfo);

  });

  $('.exBtn').on('click', () => {
    $('.projectInfo').css({
      display: 'none',
    });
  });
};
