const path = require("path");
const fs = require("fs");
const solc = require("solc");

// Path to the Lottery.sol file
const lotteryPath = path.resolve(__dirname, "contracts", "Lottery.sol");
// Read the content of the Lottery.sol file
const source = fs.readFileSync(lotteryPath, "utf8");

// Compile the source code using solc
const input = {
    language: 'Solidity',
    sources: {
        'Lottery.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode'],
            },
        },
    },
};

let output;
try {
    output = JSON.parse(solc.compile(JSON.stringify(input)));
} catch (err) {
    console.error('Error during compilation:', err);
    process.exit(1);
}

// Check for errors during compilation
if (output.errors) {
    output.errors.forEach((err) => {
        console.error(err.formattedMessage);
    });
    process.exit(1); // Exit if there are any compilation errors
}

// Export the ABI and bytecode
const contract = output.contracts['Lottery.sol'].Lottery;
module.exports = {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
};
