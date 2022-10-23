import FundMgt from './FundManagement.json';
import FMDToken from './FMDToken.json';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

// const ONE_ETH = ethers.utils.parseEther('1');
const FundMgtContractABI = FundMgt.abi;
const FMDTokenContractABI = FMDToken.abi;
const ContractAddress = "0xdDe00500B5b1eFD020CB622973de50D2FF7AF5F4";
const ethereum = typeof window !== 'undefined' && (window as any).ethereum;

type Spending = {
    purpose: string;
    amt: string;
    receiver: string;
    executed: boolean;
    approvalCount: number;
}
type FundManagement = {
    shareTokenAddress: string;
    admin: string;
    shareTokenBalance: string;
    minBuyETH: string;
    tokenMinted: string;
    spendingIdCounter: number;
    spending: Spending[];
    approvals: number[];
    stakeholders: string;
}

const getFundManagementContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(ContractAddress, FundMgtContractABI, signer);
}
const getFMDTokenContract = (fmdTokenContractAddress) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(fmdTokenContractAddress, FMDTokenContractABI, signer);
}

const useFundManagement = () => {
    // const fundManagementContract = getFundManagementContract();
    const [currentAccount, setCurrentAccount] = useState<string>('');
    // const[currentShareToken, setCurrentShareToken] = useState<string>('');
    const [fundManagementData, setFundManagementData] = useState<FundManagement | null>(null);

    const connect = async () => {
       try{
            if(!ethereum) {
                throw new Error('Please install Metamask');
            }
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' }); //eth_requestAccounts
            if (accounts.length === 0) {
                throw new Error('No authorized account found');
            }
            const account = accounts[0];
            console.log("Connected to account: ", account);
            setCurrentAccount(account);
        }catch(err){
            console.log("connect: ",err);
        }
    };

    // run when page loads
    useEffect(() => {
        if (!ethereum) {
            throw new Error("Please install Metamask");
        }
        checkAccountWhenReload();
    }, [])
    const checkAccountWhenReload = async () => {
        try{
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length != 0) {
                connect();
            }
        }catch(err){
            console.log("checkAccountWhenReload: ", err);
        }
    };

    useEffect(() => {
        if(currentAccount){
            getFundManagement();
        }
    }, [currentAccount]);

    const getFundManagement = async () => {
        const contract = getFundManagementContract();
        const shareTokenAddress : string = await contract.shareToken();
        const shareTokenContract = getFMDTokenContract(shareTokenAddress);

        const admin : string = await contract.admin();
        const shareTokenBalance = ethers.utils.formatEther(await shareTokenContract.balanceOf(currentAccount));
        const minBuyETH = ethers.utils.formatEther(await contract.minBuyETH());
        const tokenMinted = ethers.utils.formatEther(await contract.tokenMinted());
        const stakeholders = ethers.utils.formatEther(await contract.stakeholders(currentAccount));
        const spendingIdCounter : number = (await contract.spendingIdCounter()).toNumber();

        let spending : Spending[]= [];
        let approvals : number[] = [];
        for (let i = 0; i < spendingIdCounter; i++) {
            let {purpose, amt, receiver, executed, approvalCount} = await contract.spending(i);
            let approvalData = (await contract.approvals(i, currentAccount)).toString();
            console.log("approvalData: ", approvalData);
            amt = ethers.utils.formatEther(amt);
            approvalCount = ethers.utils.formatEther(approvalCount);
            spending.push({purpose, amt, receiver, executed, approvalCount});
            approvals.push(approvalData);
        }
        console.log("shareTokenAddress: ", shareTokenAddress)
        console.log("admin: ", admin)
        console.log("shareTokenBalance: ", shareTokenBalance)
        console.log("minBuyETH: ", minBuyETH)
        console.log("tokenMinted: ", tokenMinted)
        console.log("spendingIdCounter: ", spendingIdCounter)
        console.log("spending: ", spending)
        console.log("approvals: ", approvals)
        console.log("stakeholders: ", stakeholders)
        
        setFundManagementData({ shareTokenAddress, admin, shareTokenBalance, minBuyETH, tokenMinted, spendingIdCounter, spending, approvals, stakeholders });
        // return { shareTokenAddress, admin, shareTokenBalance, minBuyETH, tokenMinted, spendingIdCounter, spending, approvals, stakeholders };
    }
    return { connect, currentAccount, fundManagementData };
}




export default useFundManagement;
