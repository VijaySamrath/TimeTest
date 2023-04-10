
const hre = require("hardhat");

// console.log(hre)

async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);

    const ONE_YEARS_IN_SECONDS = 365 * 24 * 60 * 60;
    
    const unlockedTime = currentTimestampInSeconds + ONE_YEARS_IN_SECONDS;

    const lockedAmount = hre.ethers.utils.parseEther("1");

    console.log(currentTimestampInSeconds);
    console.log(ONE_YEARS_IN_SECONDS);
    console.log(unlockedTime);
    console.log(lockedAmount);

    const MyContract = await hre.ethers.getContractFactory("MyContract");
    const myContract = await MyContract.deploy(unlockedTime, { value: lockedAmount});
    
    await myContract.deployed();

    console.log(`Contrcat contatins 1 eth & address: ${myContract.address}`)
    // console.log(myContract)
}

main().catch((error) => {
    console.log(error);
    process.exitcode = 1;

});