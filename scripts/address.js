const getVersion = () => {
  return 'Memori';
};

const getNftAddress = (chainId) => {
  return {
    4: '0x16000fD872824c2a7a1CA6621b0Ab99e1C579B78',
    80001: '0xA787b5A1781De260937001d809C2ebF324448340',
    137: '0xFa68807f58BB32bAe311da29733b61281D564ff5'
  }[chainId];
};

const getTokenAddress = (chainId) => {
  return {
    4: '0x18dd62E2d471A6702938dea6c046874184F5E6c8',
    80001: '0x87b749eD3855324bd8A6cf7C0DBE3e84ead16767',
    137: '0x5dA74f1191a353c44A33399e3eA2A42d0fcd2099'
  }[chainId];
};

module.exports = {
  getVersion,
  getNftAddress,
  getTokenAddress
}