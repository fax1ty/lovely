let decodeJpeg = require('../libs/image_decoders/jpeg.js');
let { cluster } = require('../libs/utils.js');

onmessage = ({ data }) => {
  postMessage(cluster(decodeJpeg(data).data, 4));
};