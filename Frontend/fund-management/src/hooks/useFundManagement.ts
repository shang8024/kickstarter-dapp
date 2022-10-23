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
    approvalETHCount: string;
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

type Tx = {
    hash: string;
    status: boolean;
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

    const [txHashBuyFMD, setTxHashBuyFMD] = useState<Tx | null>(null);
    const [txHashCreateSpending, seTxHashCreateSpending] = useState<Tx | null>(null);

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
        } catch (err) {
            console.log("connect: ", err);
        }
    };

    const checkProjectAccountWhenReload = async () => {
        try {
            // reload account
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length != 0) {
                connect();
            }
            // reload project
            await projectProfile();
        } catch (err) {
            console.log("checkProjectAccountWhenReload: ", err);
        }
    };

    // run when page loads
    useEffect(() => {
        if (!ethereum) {
            throw new Error("Please install Metamask");
        }
        // reload account/project
        checkProjectAccountWhenReload();
    }, [])

    // run when account changes
    useEffect(() => {
        if (currentAccount) {
            accountProfile();
            projectProfile();
        }
    }, [currentAccount]);

    const projectProfile = async () => {
        const contract = getFundManagementContract();
        const shareTokenAddress: string = await contract.shareToken();
        const admin: string = await contract.admin();
        const minBuyETH = ethers.utils.formatEther(await contract.minBuyETH());
        const fmdMinted = ethers.utils.formatEther(await contract.tokenMinted());
        const spendingIdCounter: number = (await contract.spendingIdCounter()).toNumber();
        let spending: Spending[] = [];
        for (let i = 0; i < spendingIdCounter; i++) {
            let { purpose, amt, receiver, executed, approvalCount } = await contract.spending(i);
            amt = ethers.utils.formatEther(amt);
            let approvalETHCount = ethers.utils.formatEther(approvalCount);
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
            const txAmount = ethers.utils.parseEther(amount);
            const tx = await contract.deposit(txAmount, { value: txAmount });
            // const etherscanLink = `https://goerli.etherscan.io/tx/${tx.hash}`;
            setTxHashBuyFMD({ hash: tx.hash, status: false });
            console.log("tx: ", tx.hash);
            await tx.wait();
            setTxHashBuyFMD({ hash: tx.hash, status: true });

            accountProfile();
            projectProfile();
        } catch (err) {
            console.log("buyFMDToken: ", err);
        }
    }

    // amount in ETH
    const createSpending = async (receiver: string, amount: string, purpose: string) => {
        try {
            const contract = getFundManagementContract();
            const tx = await contract.createSpending(receiver, ethers.utils.parseEther(amount), purpose);
            await tx.wait();
            console.log("createSpending: ", tx);
            projectProfile();
        } catch (err) {
            console.log("createSpending: ", err);
        }
    }

    return {
        connect, 
        currentAccount, 
        projectData, 
        accountData, 
        buyFMDToken, 
        createSpending, 
        txHashBuyFMD, 
        txHashCreateSpending
    };
}





export default useFundManagement;
