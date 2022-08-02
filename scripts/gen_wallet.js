const wallet = require('ethereumjs-wallet');

for (let i = 0; i < 2; i++) {
  const newWallet = wallet.default.generate();
  const address = newWallet.getAddressString();
  const privateKey = newWallet.getPrivateKeyString();

  console.log(address, privateKey);
}
