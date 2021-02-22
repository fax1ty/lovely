let { contentView, TextView, Composite } = require('tabris');

const BAR_HEIGHT = 50;
const BAR_WIDTH = 15;
const BAR_PADDING = 5;
const BAR_COUNT = 5;
const BAR_ANIMATION_INC_MULTIPLIER = 1.5;

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

new Composite({width: BAR_WIDTH*BAR_COUNT+BAR_PADDING*(BAR_COUNT-1), height: BAR_HEIGHT*BAR_ANIMATION_INC_MULTIPLIER, centerY: 0, centerX: 0})
.append(
  new Array(BAR_COUNT).fill(0).map((_, i)=> new Composite({
    left: i== 0? 0: 'prev() 5',
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    cornerRadius: BAR_WIDTH/2,
    background: 'blue',
    centerY: 0
  }))
  )
  .onTap(({target})=>target.children(Composite).forEach(bar=>bar.animate({transform: {scaleY: getRandomFloat(1, BAR_ANIMATION_INC_MULTIPLIER)}}, {duration: 1000, reverse: true, repeat: 5*2-1})))
.appendTo(contentView);