const keccak = require('keccak');

const keccak256 = (data) => {
  return '0x' + keccak('keccak256').update(data).digest('hex');
};

module.exports = { keccak256 };