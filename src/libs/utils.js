function randomHex() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const byteToHex = [];

function initBytesToHex() {
  for (let n = 0; n <= 0xff; ++n)
  {
    let hexOctet = n.toString(16).padStart(2, '0').toUpperCase();
    byteToHex.push(hexOctet);
  }
}

function bytesToHex(bytes) {
  let hexOctets = new Array(bytes.length);

  for (let i = 0; i < bytes.length; ++i)
    hexOctets[i] = byteToHex[bytes[i]];

  return hexOctets.join(' ');
}

function getMimeByMagicBytes(magicBytes) {
  if (magicBytes = 'FF D8 FF DB' || magicBytes == 'FF D8 FF E0' || magicBytes == 'FF D8 FF EE' || magicBytes == 'FF D8 FF E1') return 'image/jpeg';
  else if (magicBytes == '89 50 4E 47') return 'image/png';
  else 'unknown';
}

function cluster(array, by) {
  return new Array(Math.ceil(array.length / by))
    .fill()
    .map(_ => array.splice(0, by));
}

module.exports = {
  randomHex: randomHex,
  bytesToHex: bytesToHex,
  initBytesToHex: initBytesToHex,
  getMimeByMagicBytes: getMimeByMagicBytes,
  cluster: cluster
}