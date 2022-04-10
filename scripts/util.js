const keccak = require('keccak');

const keccak256 = (data) => {
  return '0x' + keccak('keccak256').update(data).digest('hex');
};

const getVersion = () => {
  return 'Memori';
};

module.exports = { keccak256, getVersion };