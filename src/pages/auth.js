let { Page, ImageView, TextInput, Composite, TextView } = require('tabris');
let { navigationView } = require('../index.js');
let AppPage = require('./app.js');

module.exports = class AuthPage extends Page {
  constructor() {
    super({ left: 0, right: 0, top: 0, bottom: 0 });

    this.onAppear.once(({ target: page }) => {
      new ImageView({ left: 0, right: 0, top: 0, bottom: '55%', background: '#eee', scaleMode: 'fit' })
        .appendTo(page);
      new Composite({ left: 0, right: 0, top: 'prev() 25', bottom: 0 })
        .append(
          new Composite({ left: 25, right: 25, background: '#eee', padding: 1, height: 50, cornerRadius: 16 })
          .append(
            new TextInput({ left: 0, right: 0, top: 0, bottom: 0, style: 'none', message: 'E-mail', keyboard: 'email', floatMessage: false })
          ),
          new Composite({ top: 'prev() 15', left: 25, right: 25, background: '#eee', padding: 1, height: 50, cornerRadius: 16 })
          .append(
            new TextInput({ left: 0, right: 0, top: 0, bottom: 0, style: 'none', message: 'Пароль', type: 'password', floatMessage: false })
          ),
          new TextView({ top: 'prev() 7', left: 25, right: 25, alignment: 'right', text: 'Не можете войти?', textColor: 'blue', font: '12px' }),
          new TextView({ highlightOnTouch: true, top: 'prev() 25', padding: 15, alignment: 'centerX', font: '18px bold', left: 25, right: 25, height: 55, cornerRadius: 16, text: 'Войти', background: 'linear-gradient(147deg, #000000 0%, #04619f 74%)', textColor: '#fff' })
          .onTap(() => navigationView.append(new AppPage()))
        )
        .appendTo(page);
    });
  }
}