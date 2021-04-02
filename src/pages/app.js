let { Page, device, permission, CameraView, ImageView, TextView, contentView, Composite } = require('tabris');
let { BottomMenu, ChatWindow, RollUp, CardsStack } = require('../components.js');

module.exports = class AppPage extends Page {
  constructor() {
    super({ left: 0, right: 0, top: 0, bottom: 0 });

    this.onAppear.once(({ target: page }) => {
      let menu = new BottomMenu({ bottom: 0 })
        .appendTo(page);

      let chat = new ChatWindow({}, { left: 0, right: 0, top: 0, bottom: 'prev() 0' })
        .appendTo(page);

      menu
        .onButton(({ buttonType }) => {
          if (buttonType == 'cards') {
            chat.addMessage('Давай поищем половинку', 'in');

            let rollUp = new RollUp()
              .appendTo(contentView);

            new CardsStack()
              .insertBefore(rollUp.children(Composite).first())
            /*  .onSwipe(({ currentCard, direction, target }) => console.log(currentCard, direction, target.children().length));*/
          }
          if (buttonType == 'profile') {
            chat.addMessage('Покажи мой профиль', 'in');
            chat.addMessage('Вот Ваш профиль', 'out', 'profile');
          }
          if (buttonType == 'cam') {
            permission.requestAuthorization('camera')
              .then(() => {
                window.plugins.speechRecognition.isRecognitionAvailable(hasAbilityToRecognize => {
                  console.log(hasAbilityToRecognize);
                  if (hasAbilityToRecognize)window.plugins.speechRecognition.requestPermission(()=> {
                    window.plugins.speechRecognition.startListening(recognition => {
                          console.log(recognition);
                  }, err=> console.error(err));
                  }, err => console.error(err), { language: 'ru-RU', matches: 1, showPopup: false, showPartial: true });
                }, err => console.log(err));
                /*  let r = new RollUp()
                    .appendTo(contentView);
                  let camera = device.cameras.find(c => c.position == 'front');
                  new CameraView({ scaleMode: 'fill', background: '#fff', left: 0, right: 0, height: device.screenHeight * 0.7, camera: camera })
                    .insertBefore(r.children().first());
                  new ImageView({ width: 100, height: 100, background: '#eee', cornerRadius: 100 / 4, centerX: 0, centerY: 0 })
                    .appendTo(r);
                  new TextView({ padding: 15, alignment: 'centerX', font: '18px bold', bottom: 25, left: 25, right: 25, height: 35, cornerRadius: 35 / 4, text: 'Сказажите "Сыр!", всё остальное мы сделаем сами.', background: 'linear-gradient(147deg, #000000 0 %, #04619f 74%)', textColor: '#fff' })
                    .appendTo(r);*/
              })
              .catch(err => console.error(err));
          }
        })
        .onAudioButton(({ isListen }) => {
          if (!isListen) {
            if (chat.messages.length == 0) {
              chat.addMessage('Message from user', 'in');
              chat.addMessage('Answer from Lovely', 'out');
            }
            else if (chat.messages.length == 1) chat.addMessage('very long text cannot read too long to read sorry have to go next line', 'in');
            else if (chat.messages.length == 2) chat.addMessage('Big message from user. Sorry, u couldnt read it........', 'in');
            else chat.addMessage('test', 'in');
          }
        });
    });
  }
}