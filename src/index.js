let { NavigationView, contentView, devTools, statusBar, navigationBar } = require('tabris');
let AppPage = require('./pages/app.js');
let AuthPage = require('./pages/auth.js');

devTools.hideUi();

statusBar.background = '#fff';
statusBar.theme = 'light';
navigationBar.background = '#fff';
navigationBar.theme = 'light';

let navigationView = new NavigationView({ left: 0, right: 0, top: 0, bottom: 0, toolbarVisible: false, pageAnimation: 'none' })
  .append(
    new AppPage()
  )
  .appendTo(contentView);

module.exports.navigationView = navigationView;