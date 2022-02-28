const getVersion = () => {
  return 'MementoV4';
};

const getNftAddress = (chainId) => {
  return {
    4: "0x84725B0E283E873105f93B0762257e44c0b16295",
    80001: "0x579E54227Ef24C3790f1cff999790d1bA2B4Fa4F"
  }[chainId];
};

const getTokenAddress = (chainId) => {
  return {
    4: "0x18dd62E2d471A6702938dea6c046874184F5E6c8",
    80001: "0x7b9abF61186cF6d2E6BbC6130bEDb50FF690F8cA"
  }[chainId];
};

module.exports = {
  getVersion,
  getNftAddress,
  getTokenAddress
}