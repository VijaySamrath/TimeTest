const {time, loadFixture,} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {expect} = require("chai");
const {ethers} = require("hardhat");


describe("MyContract", function(){
    async function runEveryTime(){
        const ONE_YEARS_IN_SECONDS = 365 * 24 * 60 * 60;
        const ONE_GEWI = 1000000000;

        const lockedAmount = ONE_GEWI;
        const unlockedTime = (await time.latest()) + ONE_YEARS_IN_SECONDS;

        // console.log(ONE_YEARS_IN_SECONDS, ONE_GEWI);

        //Get Accounts
        const[owner,otherAccount] = await ethers.getSigners();
        // console.log(owner);
        // console.log(otherAccount);

        
    const MyContract = await hre.ethers.getContractFactory("MyContract");
    const myContract = await MyContract.deploy(unlockedTime, { value: lockedAmount});
    
    await myContract.deployed();

    // console.log(`Contract contatins 1 eth & address: ${myContract.address}`)

    return { myContract, unlockedTime, lockedAmount, owner, otherAccount}
    }

    describe("Deployment", function(){
        //Checking Unlocked Time
        it ("should check unlocked time", async function(){
            const {myContract, unlockedTime} = await loadFixture(runEveryTime);

           expect(await myContract.unlockedTime()).to.equal(unlockedTime);
        });

        it ("should check owner", async function(){
            const {myContract, owner} = await loadFixture(runEveryTime);

           expect(await myContract.owner()).to.equal(owner.address);
        });

        it ("should receive and store the funds to Mycontract", async function(){
            const {myContract, lockedAmount} = await loadFixture(runEveryTime);
            
            // const contractBal = await ethers.provider.getBalance(myContract.address);
            // console.log(contractBal.toNumber());
            expect(await ethers.provider.getBalance(myContract.address)).to.equal(lockedAmount);
        });
         
        //condition check
        it("Should fail if the unlocked is not in the future", async function(){
            const latestTime = await time.latest();
            console.log(latestTime / 60 / 60 / 60 / 24);

            const MyContract = await ethers.getContractFactory("MyContract");
            await expect(MyContract.deploy(latestTime, { value: 1})).to.be.revertedWith(
                "Unlocked time should be in future"
            )
        });

        describe("withdrawls", function(){
            describe("validations", function(){
                //Time Check For Withdraw
                it("should revert with the right msg if called to soon", async function(){
                    const {myContract} = await loadFixture(runEveryTime);

                    await expect(myContract.withdraw()).to.be.revertedWith("wait till the time period completed");
                })

                it("should revert with the Message for Right Owner", async function(){
                    const { myContract, unlockedTime, otherAccount } = await loadFixture(runEveryTime);

                    // const newTime = await time.increaseTo(unlockedTime);
                    // console.log(newTime);

                    await time.increaseTo(unlockedTime);
                    await expect(myContract.connect(otherAccount).withdraw()).to.be.revertedWith(" Not the owner")
                    
                });

                it("should not fail if the unlockTime has Arrived and the owner calls it", async function () {

                    const { myContract, unlockedTime, otherAccount } = await loadFixture(runEveryTime);
                    
                    await time.increaseTo(unlockedTime);
                    await expect(myContract.withdraw()).not.to.be.reverted;
                })

            });

        });

        describe("Events", function() {

            it("Should emit the event on withdrawls", async function () {
                const {myContract, unlockedTime, lockedAmount} = await loadFixture(runEveryTime);
                await time.increaseTo(unlockedTime);
                await expect(myContract.withdraw()).to.emit(myContract, "Withdrawal").withArgs(lockedAmount, anyValue);
            })

        })

    });
       //Transfer 
       describe("Transfer", function() {
        it("should transfer the fund to the owner", async function() {
            const { myContract, unlockedTime, lockedAmount, owner} = await loadFixture(runEveryTime);
            await time.increaseTo(unlockedTime);
            await expect(myContract.withdraw()).to.changeEtherBalances(
                [owner, myContract],
                [lockedAmount, -lockedAmount]
            );
        });
    });
         
    runEveryTime();
});