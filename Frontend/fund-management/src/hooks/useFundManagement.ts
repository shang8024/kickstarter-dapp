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
    approvalETHCount: number;
}
type Project = {
    shareTokenAddress: string;
    admin: string;
    minBuyETH: string;
    fmdMinted: string;
    spendingIdCounter: number;
    spending: Spending[];
}

type Account = {
    fmdBalance: string;
    ethBalance: string;
    approvals: number[];
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
    const [currentAccount, setCurrentAccount] = useState<string>('');
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [accountData, setAccountData] = useState<Account | null>(null);

    const connect = async () => {
        try {
            if (!ethereum) {
                throw new Error('Please install Metamask');
            }
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' }); //eth_requestAccounts
            if (accounts.length === 0) {
                throw new Error('No authorized account found');
            }
            const account = accounts[0];
            console.log("Connected to account: ", account);
            setCurrentAccount(account);
            projectProfile();
        } catch (err) {
            console.log("connect: ", err);
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
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length != 0) {
                connect();
            }
        } catch (err) {
            console.log("checkAccountWhenReload: ", err);
        }
    };

    useEffect(() => {
        if (currentAccount) {
            accountProfile();
        }
    }, [currentAccount]);

    const projectProfile = async () => {
        const contract = getFundManagementContract();
        const shareTokenAddress: string = await contract.shareToken();
        const shareTokenContract = getFMDTokenContract(shareTokenAddress);

        const admin: string = await contract.admin();
        const minBuyETH = ethers.utils.formatEther(await contract.minBuyETH());
        const fmdMinted = ethers.utils.formatEther(await contract.fmdMinted());
        const spendingIdCounter: number = (await contract.spendingIdCounter()).toNumber();

        let spending: Spending[] = [];
        for (let i = 0; i < spendingIdCounter; i++) {
            let { purpose, amt, receiver, executed, approvalETHCount } = await contract.spending(i);
            amt = ethers.utils.formatEther(amt);
            approvalETHCount = ethers.utils.formatEther(approvalETHCount);
            spending.push({ purpose, amt, receiver, executed, approvalETHCount });
        }
        console.log("Project data---------------------------------")
        console.log("shareTokenAddress: ", shareTokenAddress)
        console.log("admin: ", admin)
        console.log("minBuyETH: ", minBuyETH)
        console.log("fmdMinted: ", fmdMinted)
        console.log("spendingIdCounter: ", spendingIdCounter)
        console.log("spending: ", spending)

        setProjectData({ shareTokenAddress, admin, minBuyETH, fmdMinted, spendingIdCounter, spending });
    }

    const accountProfile = async () => {
        const contract = getFundManagementContract();
        const shareTokenAddress: string = await contract.shareToken();
        const shareTokenContract = getFMDTokenContract(shareTokenAddress);

        const fmdBalance = ethers.utils.formatEther(await shareTokenContract.balanceOf(currentAccount));
        const ethBalance = ethers.utils.formatEther(await contract.stakeholders(currentAccount));
        const spendingIdCounter: number = (await contract.spendingIdCounter()).toNumber();

        let approvals: number[] = [];
        for (let i = 0; i < spendingIdCounter; i++) {
            let approvalData = (await contract.approvals(i, currentAccount)).toString();
            approvals.push(approvalData);
        }
        console.log("Account data---------------------------------")
        console.log("fmdBalance: ", fmdBalance)
        console.log("ethBalance: ", ethBalance)
        console.log("approvals: ", approvals)

        setAccountData({ fmdBalance, ethBalance, approvals });
    }

    // amount in ETH, min = "0.1"
    const buyFMDToken = async (amount: string) => {
        try {
            const contract = getFundManagementContract();
            const tx = await contract.deposit({ value: ethers.utils.parseEther(amount) });
            await tx.wait();
            console.log("buyFMDToken: ", tx);
            accountProfile();
            projectProfile();
        } catch (err) {
            console.log("buyFMDToken: ", err);
        }
    }

    return { connect, currentAccount, projectData, accountData };
}




export default useFundManagement;
