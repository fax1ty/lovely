let { contentView, TextView, Composite, CameraView, device, permission, ImageView, CollectionView, ScrollView } = require('tabris');
let Fatina = require('./fatina.js');

function calcBarHeight(initHeight, i, count) {
  if (i == 0) return initHeight * 0.6;
  if (i == 1) return initHeight * 0.8;
  if (i == 2) return initHeight * 0.6;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

class AudioInputVisualizer extends Composite {
  isListening = false;

  onListening(cb) {
    return this.on('listening', cb);
  }

  constructor(props, compProps) {
    super(Object.assign(compProps, {
      height: (props.bar_height || 50) * (props.bar_animation_inc_multiplier || 1.5)
    }));

    const BAR_HEIGHT = props.bar_height || 50;
    const BAR_WIDTH = props.bar_width || 15;
    const BAR_PADDING = props.bar_padding || 5;
    const BAR_COUNT = props.bar_count || 5;
    const BAR_ANIMATION_INC_MULTIPLIER = props.bar_animation_inc_multiplier || 1.5;

    this.append(
        new Array(BAR_COUNT).fill(0).map((_, i) => new Composite({
          left: i == 0 ? 0 : 'prev() 5',
          width: BAR_WIDTH,
          height: calcBarHeight(BAR_HEIGHT, i, BAR_COUNT),
          cornerRadius: BAR_WIDTH / 2,
          background: '#000',
          centerY: 0
        }))
      )
      .onTap(({ target }) => {
        if (this.isListening) {
          DBMeter.stop(() => {
            this.isListening = false;
            target.children(Composite).forEach(bar =>
              bar.animate({ transform: { scaleY: 1 } }, { duration: 500 })
            );
            this.trigger('listening', { isListen: this.isListening });
          }, err => console.error(err));
        } else {
          this.isListening = true;
          let lerpedDb = -1;
          DBMeter.start(db => {
            if (lerpedDb == -1) {
              target.children(Composite).forEach(bar => {
                let scaledY = 1 + db / 100 / 1.5;
                bar.animate({ transform: { scaleY: scaledY > BAR_ANIMATION_INC_MULTIPLIER ? BAR_ANIMATION_INC_MULTIPLIER : scaledY } }, { duration: 250 });
              });
              lerpedDb = db;
              return;
            }
            lerpedDb = (lerpedDb + db) / 2;
            target.children(Composite).forEach(bar => {
              let scaledY = 1 + lerpedDb / 100 / 1.5;
              bar.animate({ transform: { scaleY: scaledY > BAR_ANIMATION_INC_MULTIPLIER ? BAR_ANIMATION_INC_MULTIPLIER : scaledY } }, { duration: 0 });
            });
          }, err => console.error(err));
          this.trigger('listening', { isListen: this.isListening });
        }
      });
  }
}

class AvatarScanPreview extends Composite {
  constructor(props, compProps) {
    super();

    permission.requestAuthorization('camera')
      .then(() => {
        let frontCamera = device.cameras.find(cam => cam.position == 'front');
        frontCamera.active = true;
        let containerTransparancyData = { from: 0, to: 100 };
        let cameraContainer = new Composite({ width: 200, height: 200, cornerRadius: 200 / 6, centerX: 0, centerY: 0, highlightOnTouch: true })
          .append(
            new CameraView({ top: 0, bottom: 0, left: 0, right: 0, camera: frontCamera, scaleMode: 'fill' }),
            new Composite({ left: 0, right: 0, top: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)' }),
            new ImageView({ width: 200 / 4, centerX: 0, centerY: 0, tintColor: '#fff', image: 'https://i.imgur.com/TlWc9C3.png' })
          )
          .appendTo(this);
        Fatina.tween(containerTransparancyData)
          .to({ from: 100 }, 700)
          .yoyo(1000000)
          .onUpdate(() => {
            cameraContainer.children(Composite).first().background = `linear-gradient(180deg, rgba(255,255,255,0) ${containerTransparancyData.from}%, rgba(255,255,255,1) 100%)`;
          })
          .start();
      })
      .catch(err => console.error(err));
  }
}

class Hint extends Composite {
  closeListener = () => this.close();
  widget = null;

  close(duration = 700, delay = 0) {
    this.animate({ opacity: 0 }, { duration: duration, delay: delay })
      .then(() => this.dispose());
    if (this.widget) this.widget.onTap.removeListener(this.closeListener);
  }

  constructor(text, widget, space) {
    super({ opacity: 0, left: 0, right: 0, bottom: widget.parent().absoluteBounds.height });

    this.widget = widget;

    this
      .append(
        new Composite({ left: 50, right: 50, padding: 10, cornerRadius: 10, background: '#eee' })
        .append(
          new TextView({ left: 0, right: 0, alignment: 'centerX', text: text })
        ),
        new ImageView({ top: 'prev() 0', centerX: 0, width: 9, height: 9, background: '#eee' })
      )
      .appendTo(space)
      .onTap.once(() => this.close());

    widget.onTap.once(this.closeListener);

    this.animate({ opacity: 1 }, { duration: 700 });
  }
}

const V_BAR_HEIGHT = 25;
const V_BAR_WIDTH = 5;
const V_BAR_PADDING = 2;
const V_BAR_COUNT = 3;
const audioButton = new AudioInputVisualizer({ bar_height: V_BAR_HEIGHT, bar_width: V_BAR_WIDTH, bar_padding: V_BAR_PADDING, bar_count: V_BAR_COUNT }, { centerY: 0 })
  .onResize.once(({ target: t }) => {
    new Hint('Нажатием этой иконки можно начать общаться с Lovely', t, contentView);
  });
const MENU_ICON_SIZE = 25;
const MENU_ICON_MARGIN = (device.screenWidth - (MENU_ICON_SIZE * 4) - (V_BAR_COUNT * V_BAR_WIDTH + (V_BAR_COUNT - 1) * V_BAR_PADDING)) / (5 + 1);

class BottomMenu extends Composite {
  onAudioButton(cb) {
    return this.on('audioButton', cb);
  }

  onButton(cb) {
    return this.on('button', cb);
  }

  constructor(props) {
    super(Object.assign(props, { left: 0, right: 0, height: 50, background: '#fefefe' }));

    audioButton.onListening(({ isListen }) => {
      this.trigger('audioButton', { isListen });
    });
    audioButton.left = `prev() ${MENU_ICON_MARGIN}`;

    const buttonsData = ['cards', 'cam', 'audioInput', 'any', 'profile'];

    this.append(
      buttonsData.map((buttonType, i) =>
      {
        if (i == 2) return audioButton;
        else if (i == 4) return new Composite({ highlightOnTouch: true, cornerRadius: MENU_ICON_SIZE / 2, width: MENU_ICON_SIZE, height: MENU_ICON_SIZE, background: '#000', centerY: 0, left: i == 0 ? MENU_ICON_MARGIN : `prev() ${MENU_ICON_MARGIN}` })
          .append(
            new ImageView({ cornerRadius: (MENU_ICON_SIZE - 3) / 2, scaleMode: 'fill', width: MENU_ICON_SIZE - 3, height: MENU_ICON_SIZE - 3, background: '#eee', centerY: 0, centerX: 0, image: 'https://randomuser.me/api/portraits/women/44.jpg' })
          );
        else return new Composite({ highlightOnTouch: true, cornerRadius: MENU_ICON_SIZE / 4, width: MENU_ICON_SIZE, height: MENU_ICON_SIZE, background: '#eee', centerY: 0, left: i == 0 ? MENU_ICON_MARGIN : `prev() ${MENU_ICON_MARGIN}` });

      }));
    this.children().forEach((button, i) => {
      button.onTap(() => {
        this.trigger('button', { buttonType: buttonsData[i] });
      })
    });
  }
}

const RollUpStates = {
  INIT: 0,
  IDLE: 1,
  DRAG: 2,
  CLOSING: 3,
  OPENING: 4,
  CLOSED: 5
}

class RollUp extends Composite {
  close(duration = 700) {
    this.state = RollUpStates.CLOSING;
    this.animate({ transform: { translationY: contentView.absoluteBounds.height + this.absoluteBounds.height } }, { duration: duration })
      .then(() => this.dispose());
    this.dim.animate({ opacity: 0 }, { duration: duration })
      .then(() => this.dim.dispose());
  }

  state = RollUpStates.INIT;
  DIM_INIT_OPACITY = 0.65;
  dim = new Composite({ left: 0, right: 0, top: 0, bottom: 0, background: '#000', opacity: 0 })
    .appendTo(contentView)
    .onTap(() => {});

  constructor() {
    super({ left: 0, right: 0, padding: { top: 0, bottom: 0, left: 0, right: 0 }, background: '#fff', cornerRadius: 10 });

    this.onResize(() => {
      if (this.state == RollUpStates.INIT) {
        this.animate({ transform: { translationY: contentView.absoluteBounds.height + this.absoluteBounds.height } }, { duration: 0 });
        this.dim.animate({ opacity: this.DIM_INIT_OPACITY }, { duration: 700 });
        this.animate({ transform: { translationY: contentView.absoluteBounds.height - this.absoluteBounds.height } }, { duration: 700 })
          .then(() => this.state = RollUpStates.IDLE);
      }
    });

    contentView.onResize(() => {
      if (this.state == RollUpStates.IDLE) this.animate({ transform: { translationY: contentView.absoluteBounds.height - this.absoluteBounds.height } }, { duration: 0 });
    });
    this.append(
      new Composite({ left: 0, right: 0, padding: { left: 25, right: 25 } })
      .append(
        new Composite({ centerX: 0, top: 15, width: 125, height: 5, cornerRadius: 5 / 2, background: '#000', opacity: 0.3 }),
        new Composite({ left: 0, right: 0, height: 25, top: 'prev() 0' })
      )
    );
    this.children(Composite).first()
      .onTouchStart(() => {
        this.state = RollUpStates.DRAG;
      })
      .onPan(({ state, velocityY }) => {
        if (state == 'end') {
          if (velocityY > 1000) this.close();
        }
      })
      .onTouchMove(({ touches }) => {
        if (this.state == RollUpStates.CLOSING) return;
        let t = touches[0];
        if (t.absoluteY <= contentView.absoluteBounds.height - this.absoluteBounds.height) return;
        this.dim.animate({ opacity: this.DIM_INIT_OPACITY * ((contentView.absoluteBounds.height - t.absoluteY) / this.absoluteBounds.height) }, { duration: 0 });
        this.animate({ transform: { translationY: t.absoluteY } }, { duration: 0 });
      })
      .onTouchEnd(() => {
        this.state = RollUpStates.IDLE;
        this.animate({ transform: { translationY: contentView.absoluteBounds.height - this.absoluteBounds.height } }, { duration: 500 });
        this.dim.animate({ opacity: this.DIM_INIT_OPACITY }, { duration: 500 });
      });
  }
}

class ChatWindow extends CollectionView {
  CHAT_PADDING = 15;

  messages = [];

  addMessage(text, direction, card) {
    this.messages.push({ text: text, direction: direction, card: card });
    this.insert(this.itemCount, 1);
    this.reveal(this.itemCount - 1);
  }

  constructor(props, compProps) {
    super(Object.assign({
        scrollbarVisible: false,
        itemCount: 0,
        cellType: (i) => JSON.stringify({ direction: this.messages[i].direction, card: this.messages[i].card }),
        createCell: (cellData) => {
          let { direction, card } = JSON.parse(cellData);
          let cell = new Composite({ left: 0, right: 0 })
            .append(
              new Composite({ opacity: 0, cornerRadius: 16, padding: 10, background: '#eee' })
              .append(
                new TextView({ text: 'Placeholder text' })
              )
              .onResize(({ target: messageBox }) => {
                let text = messageBox.children(TextView).first();
                if (direction == 'out') {
                  text.textColor = '#000';
                  messageBox.background = '#eee';
                } else {
                  text.textColor = '#fff';
                  messageBox.background = '#000';
                }
                if (messageBox.absoluteBounds.width + this.CHAT_PADDING * 2 >= device.screenWidth) {
                  let text = messageBox.children(TextView).first();
                  messageBox.left = this.CHAT_PADDING;
                  text.left = 0;
                  messageBox.right = this.CHAT_PADDING;
                  text.right = 0;
                  if (direction == 'out') {
                    text.alignment = 'left';
                  }
                  else { text.alignment = 'right'; }
                } else {
                  if (direction == 'out') {
                    messageBox.left = this.CHAT_PADDING;
                  }
                  else {
                    messageBox.right = this.CHAT_PADDING;
                  }
                }
              })
            );
          cell.children(Composite).first().animate({ opacity: 1 }, { duration: 900 });
          if (card) {
            if (card == 'cards') {
              new Composite({ left: 0, right: 0, top: 'prev() 10' })
                .append((() => {
                  let box = new Composite({ width: 150, height: 200, background: '#eee', cornerRadius: 150 / 8 })
                    .onPan(({ touches, velocityX, velocityY, target, state }) => {
                      let t = touches[0];
                      target.animate({ transform: { translationX: t.absoluteX } }, { duration: 0 });
                    })
                  /*.onPanLeft(({ target, touches, state }) => {
                    resolveSwipe('left', touches[0], state, target);
                  })
                  .onPanRight(({ target, touches, state }) => {
                    resolveSwipe('right', touches[0], state, target);
                  })
                  .onPanUp(({ target, touches, state }) => {
                    resolveSwipe('up', touches[0], state, target);
                  });*/
                  box.animate({ transform: { translationX: this.CHAT_PADDING } }, { duration: 0 });
                  return box;
                })())
                .appendTo(cell);
            }
            if (card == 'profile') new Composite({ left: this.CHAT_PADDING, right: this.CHAT_PADDING, background: '#eee', cornerRadius: 16, padding: 16, top: 'prev() 10' })
              .append(
                new TextView({ text: 'Зои Мёрфи' }),
                new ImageView({ cornerRadius: 50 / 4, scaleMode: 'fill', width: 50, height: 50, background: '#eee', right: 0, image: 'https://randomuser.me/api/portraits/women/44.jpg' })
              )
              .appendTo(cell);
          }
          return cell;
        },
        updateCell: (cell, i) => {
          cell.padding = { top: 25 }
          cell.children(Composite).first().children(TextView).first().text = this.messages[i].text;
        }
      },
      compProps));
  }
}

const CardsStackStates = {
  IDLE: 0,
  DRAG_X: 1,
  DRAG_Y: 2,
  CHAT: 3
}

class CardsStack extends ScrollView {
  currentCard = null;
  canGoBack = false;
  state = CardsStackStates.IDLE;

  addCard(direction) {
    let c = new ImageView({
      width: device.screenWidth,
      top: 0,
      bottom: 0,
      scaleMode: 'fill',
      image: 'https://i.imgur.com/QkvGt7E.jpg'
    });
    if (this.currentCard === null) {
      this.currentCard = 0;
      c.appendTo(this);
    } else if (direction == 'right') {
      c.left = 'prev() 0'
      c.appendTo(this);
    } else {
      c.right = 'next() 0';
      c.insertBefore(this.children().first());
    }
  }

  onSwipe(cb) {
    return this.on('swipe', cb);
  }

  constructor() {
    super({ direction: 'horizontal', scrollbarVisible: false, left: 0, right: 0, height: device.screenHeight * 0.75 });

    this.addCard();
    this.addCard('right');

    let lastY = 0;

    this
      .onTouchStart(({ touches }) => {
        let t = touches[0];
        lastY = t.absoluteY;
      })
      .onTouchEnd(({ touches }) => {
        /* let t = touches[0];
         lastY = t.absoluteY;*/
        lastY = 0;
        if (this.state == CardsStackStates.IDLE) {
          let card = this.children()[this.currentCard];
          card.animate({ transform: { translationY: 0 } }, { duration: 500 })
        }
      })
      .onTouchMove(({ touches }) => {
        if (this.state == CardsStackStates.CHAT) return;
        let t = touches[0];
        if (lastY - t.absoluteY < 0) {
          lastY = 0;
          return;
        }
        let card = this.children()[this.currentCard];
        this.state = CardsStackStates.DRAG_Y;
        card.animate({ transform: { translationY: t.absoluteY - card.absoluteBounds.height / 2 } }, { duration: 0 })
          .then(() => this.state = CardsStackStates.IDLE);
        lastY = t.absoluteY;
      })
      .onPan(({ touches, state, velocityX, velocityY }) => {
        if (this.state == CardsStackStates.CHAT) return;
        let t = touches[0];
        if (state == 'end') {
          // Движение по Y
          if (Math.abs(velocityY) > 100)
          {
            let card = this.children()[this.currentCard];
            if (velocityY < -1000) {
              card.animate({ transform: { translationY: -card.absoluteBounds.height } }, { duration: 500 })
                .then(() => this.state = CardsStackStates.CHAT);
            } else {
              card.animate({ transform: { translationY: 0 } }, { duration: 500 })
                .then(() => this.state = CardsStackStates.IDLE);
            }
          };
          
          if (this.state == CardsStackStates.DRAG_Y) return;

          // Свайпаем
          if (Math.abs(velocityX) > 1000) {
            // Вперёд
            if (velocityX < 0) {
              // Справа больше нет карт, но нам нужна ещё 1
              if (this.currentCard == this.children().length - 2) {
                this.addCard('right');
              }
              this.currentCard++;
              this.trigger('swipe', { direction: 'right', currentCard: this.currentCard });
            }
            else {
              // Назад
              if (this.currentCard == 0 && !this.canGoBack) return;
              // Слева больше нет карт, но нам нужна ещё 1
              if (this.currentCard - 1 == 0) {
                this.addCard('left');
              }
              this.currentCard--;
              this.trigger('swipe', { direction: 'left', currentCard: this.currentCard });
            }
          }
          this.scrollToX(this.currentCard * device.screenWidth, { animate: true });
        }
      });
    this.scrollToX(device.screenWidth * this.currentCard, { animate: false });
  }
}

module.exports = {
  AudioInputVisualizer: AudioInputVisualizer,
  AvatarScanPreview: AvatarScanPreview,
  BottomMenu: BottomMenu,
  RollUp: RollUp,
  ChatWindow: ChatWindow,
  CardsStack: CardsStack
}