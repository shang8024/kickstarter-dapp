// SPDX-License-Identifier: GPL-3.0
// @title A contract that represents a Found Management System
// @author Zhifei (Soso) Song

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title FMDToken
 * @dev Digital FMD Token
 */
contract FMDToken is ERC20 {

    address public admin;

    // (minter => isMinter)
    mapping(address => bool) public isMinter;

    // (holder => balance)
    // mapping(address => uint256) public balanceOf;

    // (account => (approvedSpender => isApproved))
    mapping(address => mapping(address => bool)) public isApproved;

    // event Transfer(address indexed sender, address indexed receiver, uint256 amt);

    /**
     * @dev Sets the admin that manages the FMDToken
     * @param _admin the admin who manages the FMDToken
     */
    constructor(address _admin) ERC20("FMDToken", "FMD") {
        admin = _admin;
        isMinter[admin] = true;
    }

    /**
     * @dev Mints new FMDToken to an account
     * @param receiver the account that receives the newly minted FMDToken
     * @param mintAmt the amt of FMDToken to mint
     */
    function mint(address receiver, uint256 mintAmt) public {
        require(isMinter[msg.sender], "Caller does not have minting rights");

        _mint(receiver, mintAmt);

        emit Transfer(address(0), receiver, mintAmt);
    }

     /**
     * @dev Tranfer FMDTokens from the caller's account to another account
     * @param stackholder the sender of the FMDToken transfer
     * @param receiver the receiver of the VIP Pass transfer
     * @param transferAmt the amt of FMDTokens to transfer
     */ 
    function transfer(address stackholder, address receiver, uint256 transferAmt) public {
        // note that receiver is hardcoded to admin, which is the FundManagement contract
        // we are not allowing transfer bettwen accounts other than admin
        // should be only called by contract = admin, waiting for slide about keyword != public
        require(msg.sender == admin || isApproved[stackholder][msg.sender], 
            "Transfer not allowed, sender is not msg.sender or isApproved is false"
        );
        require(receiver == admin, "Transfer not allowed, receiver must be contract");

        _transfer(stackholder, admin, transferAmt);

        emit Transfer(stackholder, admin, transferAmt);
    }

    /**
     * @dev Set Minter Permissions
     * @param minter the target minter
     * @param _isMinter whether or not the minter had minting rights
     */
    function manageMinters(address minter, bool _isMinter) public {
        require(msg.sender == admin, "Caller is not admin");

        isMinter[minter] = _isMinter;
    }

    /**
     * @dev Set the approval permission of tranferring FMDToken for caller's account
     * @param spender the target account that can havce permission to transfer caller's FMDToken
     * @param _isApproved whether or not the spender is approved
     */
    function approveSpender(address spender, bool _isApproved) public {
       isApproved[msg.sender][spender] = _isApproved;
    }

}