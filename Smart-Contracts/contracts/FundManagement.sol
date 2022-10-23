// SPDX-License-Identifier: GPL-3.0
// @title A contract that represents a Found Management System
// @author Zhifei (Soso) Song

pragma solidity >=0.7.0 <0.9.0;

import "./FMDToken.sol";

/**
 * @title FundManagement
 * @dev Digital Fund Management System
 */
contract FundManagement {

    // A Spending of Fund Management System
    struct Spending {
        string purpose; // purpose of spending, should be non-empty
        uint256 amt; // ETH amount to spend
        address receiver; // receiver of the spending
        bool executed; // whether the spending has been executed
        // mapping(address => bool) approvals; // true:+1, false:-1 (stakeholders => vote)
        uint256 approvalCount; // number of ETH tokens controlled by the addresses that approved
    }
    // (spendingIdCounter => (stakeholders => vote))
    mapping(uint256 => mapping(address => int)) public approvals; // 0 unvoted, 1 approve, -1 disapprove

    // The owner of the contract
    address public admin;

    // Min amount ETH to deposit to become a stakeholder
    uint256 public minBuyETH;

    // (holder => ETH amount deposited)
    mapping(address => uint256) public stakeholders;
    
    // (spendingId => Spending)
    mapping(uint256 => Spending) public spending;

    // percent of votes needed from total tokens to pass a spending request, number should be rounded down.
    uint256 MIN_VOTE_PERCENT = 75;

    // address of the Share Token
    address public shareToken;

    // other valiables ----------------------------------------------
    // total minted tokens in wei
    uint256 public tokenMinted; // unit in wei represent FMD token

    // helper variable to keep track of amount of spendingId
    uint256 public spendingIdCounter;

  

    // ------------------------------------------------------------------

    // Stakeholder has deposited tokens (to contract address)
    event Deposit(address indexed newStakeholder, uint256 depositAmt);

    // An approval vote has been sent
    event Vote(address indexed voter, int vote); // no spending ID
    // event Approval(address indexed stakeholder, uint256 spendingId, bool vote);

    // A new spending request has been made
    event NewSpending(address indexed receiver, uint256 spendingAmt);
    // event NewSpending(uint256 spendingId, string purpose, uint256 amt, address receiver);

    // A spending request has been executed
    event SpendingExecuted(address indexed executor, uint256 spendingId);
    // event SpendingExecuted(uint256 spendingId, string purpose, uint256 amt, address receiver);

    /**
     * @dev Sets the admin that manages the Fund Management System and the min amount of ETH to become a stakeholder
     * @param _admin the admin who manages the Fund Management System
     * @param _minBuyETH the min amount of ETH to become a stakeholder
     */
    constructor(address _admin, uint256 _minBuyETH) {
        admin = _admin;
        minBuyETH = _minBuyETH;
        shareToken = address(new FMDToken(address(this)));
    }

    /**
     * @dev Deposit ETH and mint FMD (ERC20 tokens) to sender
     * @param depositAmt the amount of ETH deposited
     */
    function deposit(uint256 depositAmt) public payable{
        // check if the deposit amount is greater than the minBuyETH
        require(depositAmt >= minBuyETH, "Deposit amount is less than minBuyETH");
        require(msg.value == depositAmt, "ETH sent and depositAmt not machting");
        // require(msg.value >= depositAmt, "Not enough ETH sent"); why we dont just use msg.value

        uint256 FMDAmt = depositAmt * 10; // 10 FMD = 1 ETH

        // mint 1 x ethChargeAmt FMD tokens to sender (1 FMD token = 0.1 ETH)     
        FMDToken(shareToken).mint(msg.sender, FMDAmt);
        tokenMinted += FMDAmt;

        // add depositAmt to the sender's balance
        stakeholders[msg.sender] += depositAmt; // unit: Gwei (1 ETH)

        emit Deposit(msg.sender, depositAmt);
    }

    /**
     * @dev Transfer FMD back to contract address (and not withdraw ETH)
     * @param transferAmt the amount of FMD to Transfer
     */
    function transfer(uint256 transferAmt) public {
        // check if the withdraw amount is greater than the minBuyETH
        require(transferAmt >= minBuyETH * 10, "transfer amount must be greater than 1 FMD = 0.1 ETH");

        uint256 ETHAmt = transferAmt / 10; // 10 FMD = 1 ETH

        // check if the transferAmt amount is less than the sender's balance
        // transferAmt is FMD, divide by 10 to get ETH amount

        require(ETHAmt <= stakeholders[msg.sender], "transfer amount is greater than sender's balance");

        // transfer FMD tokens from sender to contract address
        FMDToken(shareToken).transfer(msg.sender, transferAmt);
        // tokenMinted -= transferAmt * 10; David said we dont need to decrease tokenMinted

        // subtract transferAmt from the sender's balance
        stakeholders[msg.sender] -= ETHAmt; // unit: Gwei (1 ETH)
    }

    /**
     * @dev Admin creates a spending request
     * @param receiver the spending will be sent to this address
     * @param spendingAmt the amount of ETH to spend
     * @param _purpose the purpose of the spending
     */
    function createSpending(address receiver, uint256 spendingAmt, string memory _purpose) public {
        // check if the sender is the admin
        require(msg.sender == admin, "Only admin can create spending");
        
        // About max spendingAmt: It's ok to spend more than the contract balance because
        // executeSpending would reduce the contract balance, which still makes some spending
        // unable to perform for the moment, so it's not helpful to check it in this function.

        // About min spendingAmt: it's ok to spend less than the minBuyETH, because spending
        // is not about buying tokens, it's about spending ETH
        require(spendingAmt > 0, "Spending amount should be greater than 0");

        require(bytes(_purpose).length > 0, "Purpose should not be empty");

        spending[spendingIdCounter] = Spending({
            purpose: _purpose, // no way to get purpose from frontend?
            amt: spendingAmt,
            receiver: receiver,
            executed: false,
            approvalCount: 0
        });
        spendingIdCounter++;

        emit NewSpending(receiver, spendingAmt);
    }

    /**
     * @dev Stakeholder adds an approval vote to a spending request
     * @param spendingId the spending request ID
     * @param vote true:+1, false:-1, other:0
     */
    function approveSpending(uint256 spendingId, int vote) public {
        // check if the sender is a stakeholder
        require(stakeholders[msg.sender] > 0, "Only stakeholders can approve spending");

        // check if the vote is valid
        require(vote == 1 || vote == -1, "Vote should be 1 or -1");

        // check if the spendingId is valid, 0 <= uint256
        require(spendingId < spendingIdCounter, "Invalid spendingId");

        // check if the spending has been executed
        require(spending[spendingId].executed == false, "Spending has been executed");

        // check if the sender has not voted
        require(approvals[spendingId][msg.sender] == 0, "Sender has already voted");

        // update the vote
        approvals[spendingId][msg.sender] = vote;

        // update the approvalCount
        if (vote == 1) {
            spending[spendingId].approvalCount += stakeholders[msg.sender]; // stakeholders map to ETH amount
        } else if (spending[spendingId].approvalCount > stakeholders[msg.sender]) {
            spending[spendingId].approvalCount -= stakeholders[msg.sender]; // approvalCount is in number of FMD tokens
        } else {
            spending[spendingId].approvalCount = 0;
        }

        emit Vote(msg.sender, vote);
    }

    /**
     * @dev Send money to address if there are enough approvals
     * @param spendingId the id of the spending request
     */
    function executeSpending(uint256 spendingId) public {

        // check if the sender is the admin
        require(msg.sender == admin, "Only admin can execute spending");

        // check if the spendingId is valid
        require(spendingId < spendingIdCounter, "Invalid spendingId");

        // check if the spending has been executed
        require(spending[spendingId].executed == false, "Spending has been executed");

        // check if the spending has enough approvals
        uint256 votePercent;
        if (tokenMinted>0){
            // approvalCount is in unit of Wei repersent the amount of ETH
            // tokenMinted is in unit of Wei repersent the amount of FMD tokens
            votePercent = 1000*spending[spendingId].approvalCount/tokenMinted; // vote percentage = should be 0 ~ 100
            // Note: 1000 = 100(percent) * 10 (1 FMD = 0.1 ETH), for less calculation/gas
        }

        require(votePercent >= MIN_VOTE_PERCENT, "Not enough approvals");
        // check if the contract has enough balance
        require(address(this).balance >= spending[spendingId].amt, "Not enough balance");

        // execute the spending
        spending[spendingId].executed = true;

        // send the spending to the receiver
        (bool sent,) = spending[spendingId].receiver.call{value: spending[spendingId].amt}("");
        require(sent, "Failed to send Ether");

        emit SpendingExecuted(msg.sender, spendingId);
    }
}