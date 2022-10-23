// SPDX-License-Identifier: GPL-3.0
// @title A contract that represents a Found Management System
// @author Zhifei (Soso) Song

// require("@nomiclabs/hardhat-waffle");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const ONE_ETH = ethers.utils.parseEther('1');
const ONE_FMD = ethers.utils.parseEther('1'); // same amount of WEI, but exchange rate between ETH and FMD are 1:10
const MIN_BUY_ETH = ONE_ETH.div(10); // 0.1 ETH

describe("FundManagement", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFundManagementFixture() {
        // Contracts are deployed using the first signer/account by default
        const [admin, account1, account2, account3, account4] = await ethers.getSigners();
        const FundManagement = await ethers.getContractFactory("FundManagement");
        const fundManagement = await FundManagement.deploy(admin.address, MIN_BUY_ETH);
        await fundManagement.deployed();
        return { fundManagement, admin, account1, account2, account3, account4 };
    }
    // This fixture will only be called after create spending is tested. 
    // i.e. in approve/execute spending tests
    async function spedingFundManagementFixture() {
        const { fundManagement, admin, account1, account2, account3, account4 } = await loadFixture(deployFundManagementFixture);
  
        await fundManagement.connect(admin).createSpending(admin.address, MIN_BUY_ETH.div(2), "spend admin 0.5 FMD");
        await fundManagement.connect(admin).createSpending(account1.address, ONE_ETH, "spend account1 1 ETH");
        await fundManagement.connect(admin).createSpending(account2.address, ONE_ETH.mul(2), "spend account2 2 ETH");

        // const spendHalfMinBuytoAdmin = await fundManagement.spending(0);
        // const spend1ETHtoAcc1 = await fundManagement.spending(1);
        // const spend2ETHtoAcc2 = await fundManagement.spending(2);
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
        it("Should set the correct minBuyETH", async function () {
            const { fundManagement } = await loadFixture(deployFundManagementFixture);
            expect(await fundManagement.minBuyETH()).to.equal(MIN_BUY_ETH);
        });
    });
    
    describe("Deposit", function () {
        it("Should fail if the depositAmt is less than the minimum buy", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            await expect(fundManagement.connect(account1).deposit(MIN_BUY_ETH.sub(1))).to.be.revertedWith(
                "Deposit amount is less than minBuyETH"
            );
        });
        it("Should fail if the msg.value is less than the depositAmt", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            await expect(fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD.add(1) })).to.be.revertedWith(
                "ETH sent and depositAmt not machting"
            );
        });
        it("Should emit Deposit", async function () {
            const { fundManagement, account1, account2 } = await loadFixture(deployFundManagementFixture);
            await expect(fundManagement.connect(account1).deposit(ONE_FMD.mul(3), { value: ONE_FMD.mul(3) })).to.emit(
                fundManagement, "Deposit"
            ).withArgs(account1.address, ONE_FMD.mul(3));
        });
        it("Should receive and store the funds from shareholders to contract balance", async function () {
            const { fundManagement, account1, account2} = await loadFixture(deployFundManagementFixture);
            fundManagement.connect(account1).deposit(ONE_FMD.mul(3), { value: ONE_FMD.mul(3) }) // account1
            fundManagement.connect(account2).deposit(ONE_FMD.mul(7), { value: ONE_FMD.mul(7) }) // account2

            // check balance of contract
            expect(await ethers.provider.getBalance(fundManagement.address)).to.equal(ONE_FMD.mul(10));
        });
        it("Should receive and store the funds from shareholders to their balance", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            await fundManagement.connect(account1).deposit(ONE_FMD.mul(3), { value: ONE_FMD.mul(3) })
            // check balance of stakeholder
            expect(await fundManagement.stakeholders(account1.address)).to.equal(ONE_FMD.mul(3));

            await fundManagement.connect(account1).deposit(ONE_FMD.mul(7), { value: ONE_FMD.mul(7) })
            // check balance of stakeholder
            expect(await fundManagement.stakeholders(account1.address)).to.equal(ONE_FMD.mul(10));
        });
        it("Should update the contract/account balance", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            const depositAmt = ONE_ETH.mul(183).div(100); // 1.83 ETH
            await fundManagement.connect(account1).deposit(depositAmt, { value: depositAmt })
            // check balance of stakeholder
            expect(await fundManagement.stakeholders(account1.address)).to.equal(depositAmt);
            // check balance of contract
            expect(await ethers.provider.getBalance(fundManagement.address)).to.equal(depositAmt);
        });
        it("Should mint correct amount of token", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            const depositAmt = ONE_ETH.mul(183).div(100);    // 1.83 ETH
            const tokenAmt = ONE_FMD.mul(1830).div(100);     // 18.3 FMD
            // console.log("ETH: ", depositAmt.toString());
            // console.log("FMD: ", tokenAmt.toString());

            await fundManagement.connect(account1).deposit(depositAmt, { value: depositAmt })
            // get shareToken instance
            const shareTokenAddress = await fundManagement.shareToken();
            const shareToken = await ethers.getContractAt("FMDToken", shareTokenAddress);
            expect(await shareToken.balanceOf(account1.address)).to.equal(tokenAmt);
        });
        it("Should cost correct amount of Ether from sender", async function () {
            const { fundManagement, account1 } = await loadFixture(deployFundManagementFixture);
            const depositAmt = ONE_ETH.mul(183).div(100);

            // const account1BalanceBefore = (await ethers.provider.getBalance(account1.address)).sub((await ethers.provider.getBalance(account1.address)));
            const account1BalanceBefore = await ethers.provider.getBalance(account1.address);
            await fundManagement.connect(account1).deposit(depositAmt, { value: depositAmt })
            const account1BalanceAfter = await ethers.provider.getBalance(account1.address);
            // account1BalanceBefore.sub(account1BalanceAfter)
            const gasfee = account1BalanceBefore.sub(account1BalanceAfter).sub(depositAmt).abs();
            expect(gasfee).to.be.below(depositAmt.div(1000)); // 0.1% tolerance
        });
        it("Should receive and add the deposit to the totalMinted amount", async function () {
            const { fundManagement, account1, account2} = await loadFixture(deployFundManagementFixture);
            const depositAmt1 = ONE_ETH.mul(13); // 13 ETH
            const depositAmt2 = ONE_ETH.mul(567).div(1000);// 0.567 ETH
            await fundManagement.connect(account1).deposit(depositAmt1, { value: depositAmt1 })
            // check balance of stakeholder
            expect(await fundManagement.tokenMinted()).to.equal(ONE_FMD.mul(130)); // 13 ETH = 130 FMD
            await fundManagement.connect(account2).deposit(depositAmt2, { value: depositAmt2 }) // 13.567 ETH
            // check balance of stakeholder
            const totalMinted = ONE_FMD.mul(130).add(ONE_FMD.mul(567).div(100)); // 13.567 ETH = 135.67 FMD
            expect(await fundManagement.tokenMinted()).to.equal(totalMinted);
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
        it("Should fail if the purpose is empty", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(deployFundManagementFixture);
            const purpose = "";
            await expect(fundManagement.connect(admin).createSpending(account1.address, ONE_ETH, purpose)).to.be.revertedWith(
                "Purpose should not be empty"
            );
        });
        it("Should update spendingIdCounter", async function () {
            const { fundManagement, admin } = await loadFixture(deployFundManagementFixture);
            const purpose = "Test Purpose";
            expect(await fundManagement.spendingIdCounter()).to.equal(0);
            await fundManagement.connect(admin).createSpending(admin.address, ONE_ETH, purpose);
            expect(await fundManagement.spendingIdCounter()).to.equal(1);
        });
        it("Should emit Deposit", async function () {
            const { fundManagement, admin, account1} = await loadFixture(deployFundManagementFixture);
            const purpose = "Test Purpose";
            await expect(fundManagement.connect(admin).createSpending(account1.address, ONE_ETH, purpose)).to.emit(
                fundManagement, "NewSpending"
            ).withArgs(account1.address, ONE_ETH);
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
            await fundManagement.connect(account1).deposit( ONE_FMD.mul(3), { value: ONE_FMD.mul(3) })
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
        it("Should emit Vote", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })

            await expect(fundManagement.connect(account1).approveSpending(1,1)).to.emit(
                fundManagement, "Vote"
            ).withArgs(account1.address, 1);
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
            await fundManagement.connect(account1).deposit(ONE_FMD.mul(3), { value: ONE_FMD.mul(3) })

            const spendingBefore = await fundManagement.spending(1);
            await fundManagement.connect(account1).approveSpending(1, 1)
            const spendingAfter = await fundManagement.spending(1);

            // check approvalCount is 0 -> 3*ONE_FMD
            expect(spendingBefore.approvalCount).to.equal(0);
            expect(spendingAfter.approvalCount).to.equal(ONE_FMD.mul(3));
        });
        it("Should update correct approvalCount with two stakeholders", async function () {
            const { fundManagement, account1, account2 } = await loadFixture(spedingFundManagementFixture);
            // add account1 and account2 as stakeholders
            await fundManagement.connect(account1).deposit(ONE_FMD.mul(3), { value: ONE_FMD.mul(3) })
            await fundManagement.connect(account2).deposit(ONE_FMD.mul(7), { value: ONE_FMD.mul(7) })

            // check adding two approvals 7+3 = 10
            expect((await fundManagement.spending(1)).approvalCount).to.equal(0);
            await fundManagement.connect(account1).approveSpending(1, 1)
            await fundManagement.connect(account2).approveSpending(1, 1)
            expect((await fundManagement.spending(1)).approvalCount).to.equal(ONE_FMD.mul(10));

            // check to subtract two approvals 7-3 = 4
            expect((await fundManagement.spending(0)).approvalCount).to.equal(0);
            await fundManagement.connect(account2).approveSpending(0, 1)
            await fundManagement.connect(account1).approveSpending(0, -1)
            expect((await fundManagement.spending(0)).approvalCount).to.equal(ONE_FMD.mul(4));

            // check to subtract two approvals 3-7 = 0
            expect((await fundManagement.spending(2)).approvalCount).to.equal(0);
            await fundManagement.connect(account1).approveSpending(2, 1)
            await fundManagement.connect(account2).approveSpending(2, -1)
            expect((await fundManagement.spending(2)).approvalCount).to.equal(ONE_FMD.mul(0));
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
        it("Should emit SpendingExecuted", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(account1).deposit(ONE_FMD, { value: ONE_FMD })
            // approve spending
            await fundManagement.connect(account1).approveSpending(0, 1);

            await expect(fundManagement.connect(admin).executeSpending(0)).to.emit(
                fundManagement, "SpendingExecuted"
            ).withArgs(admin.address, 0);
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
            await fundManagement.connect(account1).deposit(ONE_ETH.mul(2), { value: ONE_ETH.mul(2) })
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
            await fundManagement.connect(account1).deposit(ONE_ETH.mul(70), { value: ONE_ETH.mul(70) })
            await fundManagement.connect(account2).deposit(ONE_ETH.mul(3), { value: ONE_ETH.mul(3) })
            await fundManagement.connect(account3).deposit(ONE_ETH.mul(10), { value: ONE_ETH.mul(10) })
            await fundManagement.connect(account4).deposit(ONE_ETH.mul(17), { value: ONE_ETH.mul(17) })

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
            await fundManagement.connect(account1).deposit(ONE_ETH.mul(70), { value: ONE_ETH.mul(70) })
            await fundManagement.connect(account2).deposit(ONE_ETH.mul(5), { value: ONE_ETH.mul(5) })
            await fundManagement.connect(account3).deposit(ONE_ETH.mul(25), { value: ONE_ETH.mul(25) })

            await fundManagement.connect(account1).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            await fundManagement.connect(account2).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            await fundManagement.connect(admin).executeSpending(0) // 75%
        });
        it("Should release spending and send the correct amount of ETH to the receiver", async function () {
            const { fundManagement, admin, account1 } = await loadFixture(spedingFundManagementFixture);
            // add account1 as stakeholder
            await fundManagement.connect(admin).deposit(ONE_ETH.mul(10), { value: ONE_ETH.mul(10), })
            await fundManagement.connect(admin).approveSpending(1, 1);

            const account1BalanceBefore = await ethers.provider.getBalance(account1.address);
            await fundManagement.connect(admin).executeSpending(1); // spending[1] = spend1ETHtoAcc1
            const account1BalanceAfter = await ethers.provider.getBalance(account1.address);

            const gasfee = account1BalanceAfter.sub(account1BalanceBefore).sub(ONE_ETH).abs();
            expect(gasfee).to.be.below(ONE_ETH.div(1000)); // 0.1% tolerance
        });
    });
    describe("Transfer", function () {
        it("Should fail if transfer amount is less than 1 FMD = minBuyETH ETH", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            await fundManagement.connect(account1).deposit(MIN_BUY_ETH, { value: MIN_BUY_ETH, })

            await expect(fundManagement.connect(account1).transfer(ONE_FMD.sub(1))).to.be.revertedWith(
                "transfer amount must be greater than 1 FMD = 0.1 ETH"
            );
            await fundManagement.connect(account1).transfer(ONE_FMD);
        });
        it("Should fail if transfer amount is greater than sender's balance", async function () {
            const { fundManagement, admin, account1, account2 } = await loadFixture(spedingFundManagementFixture);
            await fundManagement.connect(account1).deposit(MIN_BUY_ETH, { value: MIN_BUY_ETH, })

            await expect(fundManagement.connect(account1).transfer(ONE_FMD.mul(2))).to.be.revertedWith(
                "transfer amount is greater than sender's balance"
            );
        });
        it("Should fail if the sender transfers all and tries to approve spending (not the stakeholder", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            await fundManagement.connect(account1).deposit(MIN_BUY_ETH, { value: MIN_BUY_ETH, })

            // account1 can approve spending
            await fundManagement.connect(account1).approveSpending(0, 1); // spending[0] = spendHalfMinBuytoAdmin
            // account1 transfers all balance to contract
            fundManagement.connect(account1).transfer(ONE_FMD)
            // account1 can't approve spending anymore
            await expect(fundManagement.connect(account1).approveSpending(1, 1)).to.be.revertedWith(
                "Only stakeholders can approve spending"
            );
        });
        it("Should decrease the sender's token amount", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            const depositETHAmt = ONE_ETH.mul(2);
            // add 2 ETH balance to account1
            await fundManagement.connect(account1).deposit(depositETHAmt, { value: depositETHAmt, })

            // transfer 17.56 FMD = 1.756 ETH
            await fundManagement.connect(account1).transfer(ONE_FMD.mul(1756).div(100))

            // expect (2 - 1.756) * 10 = (0.244 ETH) * 10 = 2.44 FMD
            const FMDExpected = ONE_ETH.mul(244).div(1000).mul(10);

            const shareTokenAddress = await fundManagement.shareToken();
            const shareToken = await ethers.getContractAt("FMDToken", shareTokenAddress);

            expect(await shareToken.balanceOf(account1.address)).to.equal(FMDExpected);
        });
        it("Should decrease the sender's stakeholder amount", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            const depositETHAmt = ONE_ETH.mul(2);
            // add 2 ETH balance to account1
            await fundManagement.connect(account1).deposit(depositETHAmt, { value: depositETHAmt, })

            // transfer 17.56 FMD = 1.756 ETH
            await fundManagement.connect(account1).transfer(ONE_FMD.mul(1756).div(100))
            const stakeholderAfter = await fundManagement.stakeholders(account1.address);

            // expect 2 - 1.756 = 0.244 ETH
            const stakeholderExpected = ONE_ETH.mul(244).div(1000);
            expect(stakeholderAfter).to.be.equal(stakeholderExpected);
        });
        it("Should increase the contract's token amount", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            const depositETHAmt = ONE_ETH.mul(2);
            // add 2 ETH balance to account1
            await fundManagement.connect(account1).deposit(depositETHAmt, { value: depositETHAmt, })

            // transfer 17.56 FMD = 1.756 ETH
            const transTokenAmt = ONE_FMD.mul(1756).div(100);
            await fundManagement.connect(account1).transfer(transTokenAmt)

            const shareTokenAddress = await fundManagement.shareToken();
            const shareToken = await ethers.getContractAt("FMDToken", shareTokenAddress);

            // ETH balance of contract = 2 eth
            expect(await ethers.provider.getBalance(fundManagement.address)).to.equal(depositETHAmt);
            // FMD balance of contract = 17.56 FMD
            expect(await shareToken.balanceOf(fundManagement.address)).to.equal(transTokenAmt);
        });
        it("Should emit Transfer in shareToken", async function () {
            const { fundManagement, account1 } = await loadFixture(spedingFundManagementFixture);
            const depositETHAmt = ONE_ETH.mul(2);
            // add 2 ETH balance to account1
            await fundManagement.connect(account1).deposit(depositETHAmt, { value: depositETHAmt, })

            // transfer 17.56 FMD = 1.756 ETH
            const transTokenAmt = ONE_FMD.mul(1756).div(100);

            const shareTokenAddress = await fundManagement.shareToken();
            const shareToken = await ethers.getContractAt("FMDToken", shareTokenAddress);

            await expect(await fundManagement.connect(account1).transfer(transTokenAmt)).to.emit(
                shareToken, "Transfer"
            ).withArgs(account1.address, fundManagement.address, transTokenAmt);
        });
    }); 
});
