// require("@nomiclabs/hardhat-waffle");
const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const ONE_ETH = 1_000_000_000 //Gwei => 1 ETH //1_000_000_000_000_000_000//Wei //
const ONE_FMD = ONE_ETH / 10; //1 ETH = 10 FMD
const MIN_BUY = ONE_FMD; //Gwei => 0.1 ETH

describe("FundManagement", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFundManagementFixture() {
        // Contracts are deployed using the first signer/account by default
        const [admin, account1, account2, account3, account4] = await ethers.getSigners();
        const FundManagement = await ethers.getContractFactory("FundManagement");
        const fundManagement = await FundManagement.deploy(admin.address, MIN_BUY);
        await fundManagement.deployed();
        return { fundManagement, admin, account1, account2, account3, account4 };
    }
    // This fixture will only be called after create spending is tested. 
    // i.e. in approve/execute spending tests
    async function spedingFundManagementFixture() {
        const { fundManagement, admin, account1, account2, account3, account4 } = await loadFixture(deployFundManagementFixture);
  
        await fundManagement.connect(admin).createSpending(admin.address, MIN_BUY / 2, "spend admin 0.5 FMD");
        await fundManagement.connect(admin).createSpending(account1.address, ONE_ETH, "spend account1 1 ETH");
        await fundManagement.connect(admin).createSpending(account2.address, ONE_ETH * 2, "spend account2 2 ETH");

        const spendHalfMinBuytoAdmin = await fundManagement.spending(0);
        const spend1ETHtoAcc1 = await fundManagement.spending(1);
        const spend2ETHtoAcc2 = await fundManagement.spending(2);
        return { fundManagement, admin, account1, account2, account3, account4};
    }

    
    describe("Deployment", function () { // testing Constructor
        it("Should set the correct owner", async function () { // which is admin
            const { fundManagement, admin } = await loadFixture(deployFundManagementFixture);
            expect(await fundManagement.admin()).to.equal(admin.address);
        });
        it("Should set the correct shareToken owner", async function () { // which is FundManagement Contract
            const { fundManagement } = await loadFixture(deployFundManagementFixture);
            // get the shareToken address
            const shareTokenAddress = await fundManagement.shareToken();
            // get contract instance
            const shareToken = await ethers.getContractAt("FMDToken", shareTokenAddress);
            expect(await shareToken.admin()).to.equal(fundManagement.address);
        });
        it("Should set the correct minBuy", async function () {
            const { fundManagement } = await loadFixture(deployFundManagementFixture);
            expect(await fundManagement.minBuy()).to.equal(MIN_BUY);
        });
    });
    
    describe("Deposit", function () {
        it("Should fail if the depositAmt is less than the minimum buy", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            await expect(fundManagement.connect(account1).deposit(MIN_BUY - 1)).to.be.revertedWith(
                "Deposit amount is less than minBuy"
            );
        });
        it("Should fail if the msg.value is less than the depositAmt", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            await expect(fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD +1 })).to.be.revertedWith(
                "ETH sent and depositAmt not machting"
            );
        });
        it("Should receive and store the funds from shareholders to contract balance", async function () {
            const { fundManagement, account1, account2} = await loadFixture(deployFundManagementFixture);
            fundManagement.connect(account1).deposit(3 * ONE_FMD, { value: 3 * ONE_FMD }) // account1
            fundManagement.connect(account2).deposit(7 * ONE_FMD, { value: 7 * ONE_FMD }) // account2

            // check balance of contract
            expect(await ethers.provider.getBalance(fundManagement.address)).to.equal(10 * ONE_FMD);
        });
        it("Should receive and store the funds from shareholders to their balance", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            await fundManagement.connect(account1).deposit(3 * ONE_FMD, { value: 3 * ONE_FMD })
            // check balance of stakeholder
            expect(await fundManagement.stakeholders(account1.address)).to.equal(3 * ONE_FMD);

            await fundManagement.connect(account1).deposit(7 * ONE_FMD, { value: 7 * ONE_FMD })
            // check balance of stakeholder
            expect(await fundManagement.stakeholders(account1.address)).to.equal(10 * ONE_FMD);
        });
        // if they send 0.83 ETH, we will store 0.8 ETH in the contract
        it("Should calculate the change and update the contract/account balance with the charge amount only", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            const depositAmt = ONE_ETH * 0.83; //Gwei => 0.83 ETH
            await fundManagement.connect(account1).deposit(depositAmt, { value: depositAmt }) // 0.83 ETH
            // check balance of stakeholder
            expect(await fundManagement.stakeholders(account1.address)).to.equal(8 * ONE_FMD);
            // check balance of contract
            expect(await ethers.provider.getBalance(fundManagement.address)).to.equal(8 * ONE_FMD);
        });
        // if they send 0.73 ETH, we will mint 7 shareToken to the account
        it("Should calculate the change and mint an 'integer' amount of token", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            const depositAmt = ONE_ETH * 0.73; //Gwei => 0.73 ETH
            await fundManagement.connect(account1).deposit(depositAmt, { value: depositAmt })
            // get shareToken instance
            const shareTokenAddress = await fundManagement.shareToken();
            const shareToken = await ethers.getContractAt("FMDToken", shareTokenAddress);
            // console.log("ONE_FMD: ", ONE_FMD);
            expect(await shareToken.balanceOf(account1.address)).to.equal(7 * ONE_FMD);
        });
        // // if they send 0.83 ETH, we will send back 0.03 ETH
        it("Should calculate the change and send back Ether", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            let depositAmt = ONE_ETH; //Gwei => 0.83 ETH

            // const account1BalanceBefore = (await ethers.provider.getBalance(account1.address)).sub((await ethers.provider.getBalance(account1.address)));
            const account1BalanceBefore = (await ethers.provider.getBalance(account1.address));
            await fundManagement.connect(account1).deposit(depositAmt, { value: depositAmt })
            const account1BalanceAfter = (await ethers.provider.getBalance(account1.address));

            // console.log("account1BalanceBefore: ", account1BalanceBefore.toString());
            // console.log("account1BalanceAfter: ", account1BalanceAfter.toString());

            // Check account1 only spent 0.8 ETH, even account1 sent 0.83 ETH
            expect(account1BalanceBefore.sub(account1BalanceAfter)).to.equal(depositAmt);
        });
        it("Should receive and add the deposit to the totalMinted amount", async function () {
            const { fundManagement, account1, account2} = await loadFixture(deployFundManagementFixture);
            await fundManagement.connect(account1).deposit(13 * ONE_FMD, { value: 13 * ONE_FMD })
            // check balance of stakeholder
            expect(await fundManagement.tokenMinted()).to.equal(13 * ONE_FMD);
            const change = 0.8 * MIN_BUY; // check change will not be added to tokenMinted
            await fundManagement.connect(account2).deposit(17 * ONE_FMD + change, { value: 17 * ONE_FMD + change })
            // check balance of stakeholder
            expect(await fundManagement.tokenMinted()).to.equal(30 * ONE_FMD);
        });
    });
    describe("CreateSpending", function () {
        it("Should fail if the msg.sender is not the owner", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            const purpose = "Test Purpose";
            await expect(fundManagement.connect(account1).createSpending(account1.address, ONE_ETH, purpose)).to.be.revertedWith(
                "Only admin can create spending"
            );
        });
        it("Should fail if the spendingAmt is zero", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            const purpose = "Test Purpose";
            await expect(fundManagement.connect(account1).createSpending(account1.address, ONE_ETH, purpose)).to.be.revertedWith(
                "Only admin can create spending"
            );
        });
        it("Should update spendingIdCounter", async function () {
            const { fundManagement, admin } = await loadFixture(deployFundManagementFixture);
            const purpose = "Test Purpose";
            expect(await fundManagement.spendingIdCounter()).to.equal(0);
            await fundManagement.connect(admin).createSpending(admin.address, ONE_ETH, purpose);
            expect(await fundManagement.spendingIdCounter()).to.equal(1);
        });
        it("Should add new spending with the correct data", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(deployFundManagementFixture);
            const purpose = "Test Purpose";

            const spendingBefore = await fundManagement.spending(0);
            expect(spendingBefore.purpose).to.equal("");
            expect(spendingBefore.amt).to.equal(0);
            expect(spendingBefore.receiver).to.equal(ethers.constants.AddressZero);
            expect(spendingBefore.executed).to.equal(false);
            expect(spendingBefore.approvalCount).to.equal(0);

            await fundManagement.connect(admin).createSpending(account1.address, ONE_ETH+314, purpose);

            const spendingAfter = await fundManagement.spending(0);
            expect(spendingAfter.purpose).to.equal(purpose);
            expect(spendingAfter.amt).to.equal(ONE_ETH+314);
            expect(spendingAfter.receiver).to.equal(account1.address);
            expect(spendingAfter.executed).to.equal(false);
            expect(spendingAfter.approvalCount).to.equal(0);
        });
    });
    describe("ApproveSpending", function () {
        it("Should fail if the msg.sender is not a stakeholder", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            await expect(fundManagement.connect(account1).approveSpending(0, 1)).to.be.revertedWith(
                "Only stakeholders can approve spending"
            );
        });
        it("Should fail if spendingId is invalid", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })

            await expect(fundManagement.connect(account1).approveSpending(404, 1)).to.be.revertedWith(
                "Invalid spendingId"
            );
        });
        it("Should fail if vote is invalid", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })

            await expect(fundManagement.connect(account1).approveSpending(0, 0)).to.be.revertedWith(
                "Vote should be 1 or -1"
            );
        });
        it("Shoulf fail if the stakeholder has already voted", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 and account2 as stakeholders
            await fundManagement.connect(account1).deposit(3 * ONE_FMD, { value: 3 * ONE_FMD })
            await fundManagement.connect(account1).approveSpending(1, 1)
            await expect(fundManagement.connect(account1).approveSpending(1, 1)).to.be.revertedWith(
                "Sender has already voted"
            );
        });
        it("Should update correct approvals", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })
            
            // check account1 is not voted and not approved
            expect(await fundManagement.approvals(1, account1.address)).to.equal(0);
            await fundManagement.connect(account1).approveSpending(1, 1)
            // check account1 is voted and approved
            expect(await fundManagement.approvals(1, account1.address)).to.equal(1);
        });
        it("Should update correct approvals: not approve", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })

            // check account1 is not voted and not approved
            expect(await fundManagement.approvals(1, account1.address)).to.equal(0);
            await fundManagement.connect(account1).approveSpending(1, -1)
            // check account1 is voted and approved
            expect(await fundManagement.approvals(1, account1.address)).to.equal(-1);
        });
        it("Should update correct approvalCount", async function () {
            const { fundManagement, account1} = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(3 * ONE_FMD, { value: 3 * ONE_FMD })

            const spendingBefore = await fundManagement.spending(1);
            await fundManagement.connect(account1).approveSpending(1, 1)
            const spendingAfter = await fundManagement.spending(1);

            // check approvalCount is 0 -> 3*ONE_FMD
            expect(spendingBefore.approvalCount).to.equal(0);
            expect(spendingAfter.approvalCount).to.equal(3*ONE_FMD);
        });
        it("Should update correct approvalCount with two stakeholders", async function () {
            const { fundManagement, account1, account2 } = await loadFixture(spedingFundManagementFixture);
            // add account1 and account2 as stakeholders
            await fundManagement.connect(account1).deposit(3 * ONE_FMD, { value: 3 * ONE_FMD })
            await fundManagement.connect(account2).deposit(7 * ONE_FMD, { value: 7 * ONE_FMD })

            // check adding two approvals 7+3 = 10
            expect((await fundManagement.spending(1)).approvalCount).to.equal(0);
            await fundManagement.connect(account1).approveSpending(1, 1)
            await fundManagement.connect(account2).approveSpending(1, 1)
            expect((await fundManagement.spending(1)).approvalCount).to.equal(10 * ONE_FMD);

            // check to subtract two approvals 7-3 = 4
            expect((await fundManagement.spending(0)).approvalCount).to.equal(0);
            await fundManagement.connect(account2).approveSpending(0, 1)
            await fundManagement.connect(account1).approveSpending(0, -1)
            expect((await fundManagement.spending(0)).approvalCount).to.equal(4 * ONE_FMD);

            // check to subtract two approvals 3-7 = 0
            expect((await fundManagement.spending(2)).approvalCount).to.equal(0);
            await fundManagement.connect(account1).approveSpending(2, 1)
            await fundManagement.connect(account2).approveSpending(2, -1)
            expect((await fundManagement.spending(2)).approvalCount).to.equal(0 * ONE_FMD);
        });
        it("Shoulf fail if spending has been executed", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })
            // approve spending
            await fundManagement.connect(account1).approveSpending(0, 1);
            // execute spending
            await fundManagement.connect(admin).executeSpending(0);
            // check spending has been executed
            expect((await fundManagement.spending(0)).executed).to.equal(true);
            // execute spending again
            await expect(fundManagement.connect(account1).approveSpending(0, -1)).to.be.revertedWith(
                "Spending has been executed"
            );
        });
    });
    describe("ExecuteSpending", function () {
        it("Should fail if sender is not admin", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            // check account1 is not stakeholder
            await expect(fundManagement.connect(account1).executeSpending(0)).to.be.revertedWith(
                "Only admin can execute spending"
            );
        });
        it("Should fail if spendingId is invalid", async function () {
            const { fundManagement, admin } = await loadFixture(spedingFundManagementFixture);
            // execute spending
            await expect(fundManagement.connect(admin).executeSpending(404)).to.be.revertedWith(
                "Invalid spendingId"
            );
        });
        it("Should fail if not enough approvals", async function () {
            const { fundManagement, admin } = await loadFixture(spedingFundManagementFixture);
            // execute spending
            await expect(fundManagement.connect(admin).executeSpending(0)).to.be.revertedWith(
                "Not enough approvals"
            );
        }); 
        it("Should execute spending", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })
            // approve spending
            await fundManagement.connect(account1).approveSpending(0, 1);
            // execute spending
            await fundManagement.connect(admin).executeSpending(0);
            // check spending has been executed
            expect((await fundManagement.spending(0)).executed).to.equal(true);
        });   
        it("Should fail if spending has been executed", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })
            // approve spending
            await fundManagement.connect(account1).approveSpending(0, 1);
            // execute spending
            await fundManagement.connect(admin).executeSpending(0);
            // check spending has been executed
            expect((await fundManagement.spending(0)).executed).to.equal(true);
            // execute spending again
            await expect(fundManagement.connect(admin).executeSpending(0)).to.be.revertedWith(
                "Spending has been executed"
            );
        });
        it("Should fail if not enough contract balance", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(2 * ONE_ETH, { value: 2 * ONE_ETH })
            await fundManagement.connect(account1).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            await fundManagement.connect(account1).approveSpending(1, 1); // spending[1] = spend1ETHtoAcc1
            await fundManagement.connect(account1).approveSpending(2, 1); // spending[2] = spend2ETHtoAcc2

            await fundManagement.connect(admin).executeSpending(0);
            await fundManagement.connect(admin).executeSpending(1);
            await expect(fundManagement.connect(admin).executeSpending(2)).to.be.revertedWith(
                "Not enough balance"
            );
        }); 

        it("Should fail if 75%- MIN_VOTE_PERCENT, 3 users", async function () {
            const { fundManagement, admin, account1, account2, account3, account4} = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(70 * ONE_ETH, { value: 70 * ONE_ETH })
            await fundManagement.connect(account2).deposit(3 * ONE_ETH, { value: 3 * ONE_ETH })
            await fundManagement.connect(account3).deposit(10 * ONE_ETH, { value: 10 * ONE_ETH })
            await fundManagement.connect(account4).deposit(17 * ONE_ETH, { value: 17 * ONE_ETH })

            await fundManagement.connect(account1).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            await fundManagement.connect(account2).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            await expect(fundManagement.connect(admin).executeSpending(0)).to.be.revertedWith( // 73%
                "Not enough approvals"
            );

            await fundManagement.connect(account3).approveSpending(0, -1); // spending[0] = spendHalfMinBuytoAdmin
            await expect(fundManagement.connect(admin).executeSpending(0)).to.be.revertedWith( // 73%
                "Not enough approvals"
            );

            await fundManagement.connect(account4).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            await fundManagement.connect(admin).executeSpending(0) // 90%
        }); 
        it("Should run if >=75% MIN_VOTE_PERCENT, 3 users", async function () {
            //fundManagement, admin, account2, account3, account4, spendHalfMinBuytoAdmin, spend1ETHtoAcc1, spend2ETHtoAcc2 
            const { fundManagement, admin, account1, account2, account3, account4 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(70 * ONE_ETH, { value: 70 * ONE_ETH })
            await fundManagement.connect(account2).deposit(5 * ONE_ETH, { value: 5 * ONE_ETH })
            await fundManagement.connect(account3).deposit(25 * ONE_ETH, { value: 25 * ONE_ETH })

            await fundManagement.connect(account1).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            await fundManagement.connect(account2).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            await fundManagement.connect(admin).executeSpending(0) // 75%
        });
        it("Should release spending and send the correct amount of ETH to the receiver", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(admin).deposit(10 * ONE_ETH, { value: 10 * ONE_ETH, })
            await fundManagement.connect(admin).approveSpending(1, 1);

            const account1BalanceBefore = await ethers.provider.getBalance(account1.address);
            await fundManagement.connect(admin).executeSpending(1); // spending[1] = spend1ETHtoAcc1
            const account1BalanceAfter = await ethers.provider.getBalance(account1.address);
            
            // console.log("account1BalanceBefore: ", account1BalanceBefore.toString());
            // console.log("account1BalanceAfter: ", account1BalanceAfter.toString());

            // admin balance account1BalanceAfter - account1BalanceBefore ~= ONE_ETH
            const gasfee = (account1BalanceAfter - account1BalanceBefore) - ONE_ETH;
            expect(gasfee).to.be.lessThan(ONE_ETH / 1000); 
        });
    });
});


// expected[
//     'Test Purpose',
//     BigNumber { value: "100000000" },
//     '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
//     false,
//     BigNumber { value: "0" },

//     purpose: 'Test Purpose',
//     amt: BigNumber { value: "100000000" },
//     receiver: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
//     executed: false,
//     approvalCount: BigNumber { value: "0" }
// ]

// deeply equal[
//     '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
//     100000000,
//     'Test Purpose'
// ]