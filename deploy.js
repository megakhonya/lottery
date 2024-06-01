const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'infant inject grocery chief pink wet enlist replace script swift science dignity',
  'https://eth-sepolia.g.alchemy.com/v2/P0Plmoav_A2Sx1WlDi_ZAmupdVukhzwk'
);

let web3;
if (Web3.default) {
  web3 = new Web3.default(provider);
} else {
  web3 = new Web3(provider);
}

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  // Debugging statements to print ABI and bytecode
  console.log('ABI:', JSON.stringify(abi));
  console.log('Bytecode:', bytecode);

  try {
    const result = await new web3.eth.Contract(abi)
      .deploy({ data: bytecode })
      .send({ gas: '1000000', from: accounts[0] });

    console.log("Contract deployed to", result.options.address);
  } catch (error) {
    console.error('Error deploying contract:', error);
  }

  provider.engine.stop();
};

deploy();
