let { ChatWindow, AvatarScanPreview, AudioInputVisualizer, BottomMenu, RollUp, CardsStack } = require('./components.js');
let { app, contentView, Composite, device, statusBar, navigationBar, TextView, ImageView, ScrollView, CollectionView, devTools, CameraView, permission } = require('tabris');
let { initBytesToHex, bytesToHex, getMimeByMagicBytes } = require('./libs/utils.js');
let getJpegData = require('./libs/image_decoders/jpeg.js');

devTools.hideUi();

statusBar.background = '#fff';
statusBar.theme = 'light';
navigationBar.background = '#fff';
navigationBar.theme = 'light';

initBytesToHex();

let menu = new BottomMenu({ bottom: 0 })
  .appendTo(contentView);

let chat = new ChatWindow({}, { left: 0, right: 0, top: 0, bottom: 'prev() 0' })
  .appendTo(contentView);

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
          let r = new RollUp()
            .appendTo(contentView);
          new CameraView({ scaleMode: 'fill', background: '#fff', left: 0, right: 0, height: device.screenHeight * 0.7, camera: camera })
            .insertBefore(r.children().first());
          new ImageView({ width: 100, height: 100, background: '#eee', cornerRadius: 100 / 4, centerX: 0, centerY: 0 })
            .appendTo(r);
          new TextView({ padding: 15, alignment: 'centerX', font: '18px bold', bottom: 25, left: 25, right: 25, height: 35, cornerRadius: 35 / 4, text: 'Сказажите "Сыр!", всё остальное мы сделаем сами.', background: 'linear-gradient(147deg, #000000 0 %, #04619f 74%)', textColor: '#fff' })
            .appendTo(r);
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