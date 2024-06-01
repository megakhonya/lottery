const assert = require('assert');
const ganache = require('ganache');
const Web3 = require('web3').default;
const web3 = new Web3(ganache.provider({ gasLimit: 8000000 }));
const { abi, bytecode } = require('../compile');
const BN = require('bn.js');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('should deploy the contract', async () => {
        assert.ok(lottery.options.address);
    });

    it('should allow one player to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(players.length, 1);
        assert.equal(players[0], accounts[1]);
    });

    it('should allow multiple players to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(players.length, 2);
        assert.equal(players[0], accounts[1]);
        assert.equal(players[1], accounts[2]);
    });

    it('should require a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei('0.009', 'ether')
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('should only allow the manager to pick a winner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('should pick a winner, send money, and reset the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('2', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = new BN(await web3.eth.getBalance(accounts[1]));
        console.log("Initial Balance: ", initialBalance.toString());

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = new BN(await web3.eth.getBalance(accounts[1]));
        console.log("Final Balance: ", finalBalance.toString());

        const difference = finalBalance.sub(initialBalance);
        console.log("Difference: ", difference.toString());

        const expectedMinDifference = new BN(web3.utils.toWei('1.75', 'ether'));
        console.log("Expected Minimum Difference: ", expectedMinDifference.toString());

        assert(difference.gte(expectedMinDifference), "The difference should be greater than or equal to the expected minimum difference.");

        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
        assert.equal(players.length, 0);

        const lotteryBalance = await web3.eth.getBalance(lottery.options.address);
        assert.equal(lotteryBalance, 0);
    });
});
