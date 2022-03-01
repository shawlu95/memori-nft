const getVersion = () => {
  return 'Memori';
};

const getNftAddress = (chainId) => {
  return {
    4: "0x021F338415De93882E870E78532A5fdB68f06e5A",
    80001: "0xC16F9811eB73336A086Fc86bA888ec43A62d4634",
    137: "0xb012DD7b75895F120205040B0fbE375208edDc27"
  }[chainId];
};

const getTokenAddress = (chainId) => {
  return {
    4: "0x18dd62E2d471A6702938dea6c046874184F5E6c8",
    80001: "0x87b749eD3855324bd8A6cf7C0DBE3e84ead16767",
    137: "0x5dA74f1191a353c44A33399e3eA2A42d0fcd2099"
  }[chainId];
};

module.exports = {
  getVersion,
  getNftAddress,
  getTokenAddress
}