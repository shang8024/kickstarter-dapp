import React from 'react';
import useFundManagement from '../../hooks/useFundManagement.ts';
import SpendingCardContent from '../SpendingCard';
import { 
    CircularProgress, 
    TextField,
    Grid,
    Button,
    Divider,
    Card,
    Box,
    CardActions,
    CardContent,
    Typography,
} from '@mui/material';
// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';

import InputAdornment from '@mui/material/InputAdornment';

const CompanyScreen = (props) => {
    const { 
        connect, 
        currentAccount, 
        projectData, 
        accountData, 
        buyFMDToken,
        returnFMDToken,
        approveSpending,
        createSpending,
        executeSpending,
        txBuyFMD,
        txReturnFMD,
        txApproveSpend,
        txCreateSpending,
        txExecuteSpending,
    } = useFundManagement();

    // console.log(projectData);

    // console.log("CompanyScreen: account = ", currentAccount);
    const [open, setOpen] = React.useState(false);
    const [key, setKey] = React.useState('');
    const [amount, setAmount] = React.useState(0);
    // const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [buyFMD, setBuyFMD] = React.useState(0);
    const [returnFMD, setReturnFMD] = React.useState(0);
    const [buyETH, setBuyETH] = React.useState(0);

    // Create Spending Textfield
    const [createSpendingPurpose, setCreateSpendingPurpose] = React.useState('');
    const [createSpendingAmount, setCreateSpendingAmount] = React.useState('');
    const [createSpendingReceiver, setCreateSpendingReceiver] = React.useState('');


    const slide = (func) => {
        let slider = document.getElementsByClassName('slide-container')[0]
        let cardLen = (window.innerWidth <= 1180) ?
                        0.5*window.innerWidth - 15 :
                        0.3333*window.innerWidth - 10;
        let change = (window.innerWidth <= 1180) ? 2: 3;
        let curCard = Math.round(slider.scrollLeft/cardLen);
        slider.scroll(cardLen * (func(curCard,change)),0);
    };

    // const data = {
    //     companyName: 'Company Name',
    //     title: 'Title',
    //     description: 'This is a mock company page. You can subscribe to this company to become a stakeholder. You will be able to see the proposals and vote!',
    // }

    const changeFMD = (e) => {
        if (e.target.value < 1){
            e.target.reportValidity();
            e.target.setCustomValidity('Please enter a number greater than or equal to 1');
            e.target.value = 1;
        }else{
            e.target.setCustomValidity('');
        }
        setBuyFMD(e.target.value);
        setBuyETH(e.target.value * 0.1);
    }

    const changeETH = (e) => {
        if (e.target.value < 0.1){
            e.target.reportValidity();
            e.target.setCustomValidity('Please enter a number greater than or equal to 0.1');
            e.target.value = 0.1;
        }else{
            e.target.setCustomValidity('');
        }
        setBuyETH(e.target.value);
        setBuyFMD(e.target.value * 10);
    }

    // const sentBuyFMD = (e) => {
    //     // if (buyFMD < 1) {
    //     //     // fmdInput.current.reportValidity();
    //     //     // fmdInput.current.setCustomValidity('Please enter a number greater than or equal to 1');
    //     //     return;
    //     // }
    //     buyFMDToken(buyETH.toString());
    // }

    // const sentReturnFMD = (e) => {
    //     // size of returnFMD is checked/handled in this functino:
    //     returnFMDToken(returnFMD.toString());
    // }

    // const sentCreateSpending = (e) => {
    //     // size of returnFMD is checked/handled in this functino:
    //     createSpending(returnFMD.toString());
    // }

    const reduceHash = (hash) => {
        return hash.slice(0, 6) + '...' + hash.slice(hash.length - 4, hash.length);
    }
    // get ethereum link
    const getEtherscanLink = (txHash, type) => {
        let prefix = 'https://goerli.etherscan.io/';
        switch (type) {
            case 'tx':
                return prefix + 'tx/' + txHash;
            case 'address':
                return prefix + 'address/' + txHash;
            default:
                return prefix + 'tx/' + txHash;
        }
    }

 

    return (

        <div id="page-wrapper">
            <div id='header-wrapper'>
                <header className='container'>
                    <div id='logo'>
                        
                        <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Grid item xs>
                                <h1><a target="_blank" href='#'>Kickstarter</a></h1>
                            </Grid>
                            <Grid item xs>
                                <h4 style={{
                                    position: "absolute",
                                    right: "0"
                                }}>
                                    <a target="_blank" href='https://github.com/soso-song/kickstarter-dapp'>Github: kickstarter-dapp</a><br/>
                                    <a target="_blank" href='https://github.com/soso-song'>Author: Soso Song</a>
                                </h4>
                            </Grid>
                        </Grid>
                    </div>
                </header>
            </div>
            <div id="main-wrapper">
                <div className='container'>
                    <Grid container spacing={2}>
                        <Grid item xs={6} >
                            <h2>Project Profile:</h2>
                            Project Contract Address: {projectData && 
                                    <a target="_blank" href={getEtherscanLink(projectData.ContractAddress, 'address')}>
                                    {reduceHash(projectData.ContractAddress)}
                                    </a>
                            }
                            <br />
                            Project Admin Address: {projectData &&
                                <a target="_blank" href={getEtherscanLink(projectData.admin, 'address')}>
                                    {reduceHash(projectData.admin)}
                                </a>
                            }
                            <br />
                            FMD Token Contract Address: {projectData &&
                                <a target="_blank" href={getEtherscanLink(projectData.shareTokenAddress, 'address')}>
                                    {reduceHash(projectData.shareTokenAddress)}
                                </a>
                            }
                            <br/>
                            MinbuyFMD: {projectData && projectData.minBuyETH * 10}
                            <br />
                            <br />
                            FMD Balance: {projectData && projectData.fmdBalance}
                            <br />
                            FMD Minted: {projectData && projectData.fmdMinted}
                            <br/>
                            ETH Balance: {projectData && projectData.ethBalance}
                            <br />
                            
                            
                        </Grid>
                        <Grid item xs={6} >
                            <h2>Account Profile:</h2>
                            {/* <button
                                className='button'
                                onClick={connect}>
                                <span>{currentAccount ? 'Connected' : 'Connect to MetaMask'}</span>
                            </button> */}
                            
                            {/* <div id='subscription-info'>
                                {!currentAccount ? null : <p>Address: {currentAccount}</p>}
                            </div> */}
                            <TextField
                                label="Address"
                                value={currentAccount}
                                // min={0}
                                disabled
                                fullWidth
                                // id="outlined-basic"
                                variant="standard"
                                margin="dense"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">
                                        
                                        <Button
                                            fullWidth
                                            // margin="dense"
                                            variant="contained"
                                            onClick={connect}
                                        >{currentAccount ? 'Connected' : 'Connect to MetaMask'}</Button>
                                    </InputAdornment>,
                                }}
                            />
                            
                            Is Admin: {projectData && (currentAccount.toUpperCase() == projectData.admin.toUpperCase()).toString()}
                            <br />
                            <br />
                            FMD Balance: {accountData && accountData.fmdBalance}
                            
                        </Grid>
                    </Grid>
                </div>  
            </div>

            <br/>

            <div className='container'>
            <Grid container spacing={2}>
                <Grid item xs={6} >
                    Vote Button Msg:
                    <>{
                        !txApproveSpend ? null :
                            !!txApproveSpend.errorMsg ?
                                <span style={{ color: 'red' }}>{txApproveSpend.errorMsg}</span>
                                :
                                !txApproveSpend.status ?
                                    <div>
                                        <CircularProgress size="0.5rem" color="inherit" />
                                        &emsp;&emsp;
                                        <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txApproveSpend.hash}>{reduceHash(txApproveSpend.hash)}</a>
                                    </div>
                                    :
                                    <div>
                                        <CircularProgress variant="determinate" size="0.5rem" color="success" value={100} />
                                        &emsp;&emsp;
                                        <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txApproveSpend.hash}>{reduceHash(txApproveSpend.hash)}</a>
                                    </div>
                    }</>
                </Grid>
                <Grid item xs={6} >
                    Exec Button Msg:
                    <>{
                        !txExecuteSpending ? null :
                            !!txExecuteSpending.errorMsg ?
                                <span style={{ color: 'red' }}>{txExecuteSpending.errorMsg}</span>
                                :
                                !txExecuteSpending.status ?
                                    <div>
                                        <CircularProgress size="0.5rem" color="inherit" />
                                        &emsp;&emsp;
                                        <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txExecuteSpending.hash}>{reduceHash(txExecuteSpending.hash)}</a>
                                    </div>
                                    :
                                    <div>
                                        <CircularProgress variant="determinate" size="0.5rem" color="success" value={100} />
                                        &emsp;&emsp;
                                        <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txExecuteSpending.hash}>{reduceHash(txExecuteSpending.hash)}</a>
                                    </div>
                    }</>
                </Grid>
            </Grid>
            </div>

            {currentAccount &&
                <div className='slider'>
                    <button className='slide-prev button' onClick={() => slide((a, b) => a - b)}>&#8249;</button>
                    <div className="slide-container rootClass" >
                        <div className="slide-content">
                            {
                                projectData && projectData.spending.map((spending, index) => <>
                                    <Card sx={{ minWidth: 300, mx: 2 }} key={index}>
                                        <SpendingCardContent
                                            key={index.toString()} index={index}
                                            spending={spending}
                                            fmdMinted={projectData.fmdMinted} /
                                        >
                                        <TextField
                                            label="Recipient"
                                            value={spending.receiver}
                                            disabled
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            size="small"
                                        />
                                        <TextField
                                            label="Purpose"
                                            value={spending.purpose}
                                            onChange={e => setCreateSpendingPurpose(e.target.value)}
                                            fullWidth
                                            disabled
                                            // id="outlined-multiline-static"
                                            multiline
                                            rows={4}
                                            margin="dense"
                                            // helperText=
                                        />
                                        <CardActions>
                                            <Grid container spacing={2}>
                                                {/* <button className="button" id='reject' onClick={()=>respondProposal('rejected')}>Reject</button>
                                                    <button className="button" id='approve' onClick={()=>respondProposal('approved')}>Approve</button> */}
                                                <Grid item xs={6}>
                                                    <Button
                                                        fullWidth
                                                        margin="dense"
                                                        variant="contained"
                                                        onClick={() => approveSpending(index, -1)}
                                                        disabled={accountData.approvals[index] != 0}
                                                    >
                                                        {accountData.approvals[index] != -1 ? 'Reject' : 'You Rejected'}
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Button
                                                        fullWidth
                                                        margin="dense"
                                                        variant="contained"
                                                        onClick={() => approveSpending(index, 1)}
                                                        disabled={accountData.approvals[index] != 0}
                                                    >
                                                        {accountData.approvals[index] != 1 ? 'Approve' : 'You Approved'}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </CardActions>
                                        <CardActions>
                                            <Button
                                                fullWidth
                                                margin="dense"
                                                variant="contained"
                                                onClick={() => executeSpending(index)}
                                                disabled={spending.executed}
                                            >
                                                {spending.executed ? 'Executed(Admin)' : 'Execute(Admin)'}
                                            </Button>
                                        </CardActions>
                                    </Card></>)
                            }
                        </div>
                    </div>
                    <button className='slide-next button' onClick={() => slide((a, b) => a + b)}>&#8250;</button>
                </div>
            }

            <br />

            <div id="main-wrapper">
                <div className='container'>
                    Buy FMD
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Spend Amount"
                                value={buyETH}
                                onChange={e => changeETH(e)}
                                type='number'
                                fullWidth
                                id="outlined-basic"
                                variant="outlined"
                                margin="dense"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">
                                        Goerli Ξ
                                    </InputAdornment>,
                                }}
                                helperText={
                                    !txBuyFMD ? null :
                                        !!txBuyFMD.errorMsg ?
                                            <span style={{ color: 'red' }}>{txBuyFMD.errorMsg}</span>
                                            :
                                            !txBuyFMD.status ?
                                                <div>
                                                    <CircularProgress size="0.5rem" color="inherit" />
                                                    &emsp;&emsp;
                                                    <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txBuyFMD.hash}>{reduceHash(txBuyFMD.hash)}</a>
                                                </div>
                                                :
                                                <div>
                                                    <CircularProgress variant="determinate" size="0.5rem" color="success" value={100} />
                                                    &emsp;&emsp;
                                                    <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txBuyFMD.hash}>{reduceHash(txBuyFMD.hash)}</a>
                                                </div>
                                }
                            />
                        </Grid>
                    
                        <Grid item xs={6}>
                            <TextField
                                label="Buy Amount"
                                value={buyFMD}
                                onChange={e => changeFMD(e)}
                                type='number'
                                fullWidth
                                id="outlined-basic"
                                variant="outlined"
                                margin="dense"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">
                                        FMD
                                        <Divider sx={{
                                            height: 30,
                                            m: 2,
                                            width: 'fit-content',
                                        }} orientation="vertical" />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={(e) => buyFMDToken(buyETH.toString())}
                                        >Buy</Button>
                                    </InputAdornment>,
                                }}
                            />
                        </Grid>
                    </Grid>

                    Return FMD to Project
                    <TextField
                        label="Amount"
                        value={returnFMD}
                        onChange={e => setReturnFMD(e.target.value)}
                        type='number'
                        // min={0}
                        fullWidth
                        id="outlined-basic"
                        variant="outlined"
                        margin="dense"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">
                                FMD
                                <Divider sx={{
                                    height: 30,
                                    m: 2,
                                    width: 'fit-content',
                                }} orientation="vertical" />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={(e) => returnFMDToken(returnFMD.toString())}
                                >Return</Button>
                            </InputAdornment>,
                        }}
                        
                        helperText={
                            !txReturnFMD ? null :
                                !!txReturnFMD.errorMsg ? 
                                    <span style={{ color: 'red' }}>{txReturnFMD.errorMsg}</span> 
                                    :
                                    !txReturnFMD.status ?
                                        <div>
                                            <CircularProgress size="0.5rem" color="inherit" />
                                            &emsp;&emsp;
                                            <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txReturnFMD.hash}>{reduceHash(txReturnFMD.hash)}</a>
                                        </div>
                                        :
                                        <div>
                                            <CircularProgress variant="determinate" size="0.5rem" color="success" value={100} /> 
                                            &emsp;&emsp;
                                            <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txReturnFMD.hash}>{reduceHash(txReturnFMD.hash)}</a>
                                        </div>
                        }
                    />
                    
                    Create Spending:
                    <TextField
                        label="Purpose"
                        value={createSpendingPurpose}
                        onChange={e => setCreateSpendingPurpose(e.target.value)}
                        fullWidth
                        id="outlined-multiline-static"
                        multiline
                        rows={4}
                        margin="dense"
                        // helperText="Incorrect entry."
                    // defaultValue="Default Value"
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <TextField
                                label="Amount"
                                value={createSpendingAmount}
                                onChange={e => setCreateSpendingAmount(e.target.value)}
                                fullWidth
                                // min={0}
                                type='number'
                                id="outlined-basic"
                                variant="outlined"
                                margin="dense"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">
                                        Goerli Ξ
                                    </InputAdornment>,
                                }}
                                helperText={
                                    !txCreateSpending ? null :
                                        !!txCreateSpending.errorMsg ?
                                            <span style={{ color: 'red' }}>{txCreateSpending.errorMsg}</span>
                                            :
                                            !txCreateSpending.status ?
                                                <div>
                                                    <CircularProgress size="0.5rem" color="inherit" />
                                                    &emsp;&emsp;
                                                    <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txCreateSpending.hash}>{reduceHash(txCreateSpending.hash)}</a>
                                                </div>
                                                :
                                                <div>
                                                    <CircularProgress variant="determinate" size="0.5rem" color="success" value={100} />
                                                    &emsp;&emsp;
                                                    <a target="_blank" href={'https://goerli.etherscan.io/tx/' + txCreateSpending.hash}>{reduceHash(txCreateSpending.hash)}</a>
                                                </div>
                                }
                            // value={95}
                            // onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={8}>
                            <TextField
                                label="Recipient Address"
                                value={createSpendingReceiver}
                                onChange={e => setCreateSpendingReceiver(e.target.value)}
                                fullWidth
                                id="outlined-basic"
                                variant="outlined"
                                margin="dense"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">
                                        <Divider sx={{ 
                                            height: 30, 
                                            m: 2,
                                            width: 'fit-content',
                                        }} orientation="vertical" />
                                        <Button
                                            fullWidth
                                            // margin="dense"
                                            variant="contained"
                                            onClick={() => createSpending(
                                                createSpendingReceiver.toString(),//"0xDBEFE09D505fEd9E236586b41Db39f5F0D55d49f", // must be wallet address
                                                createSpendingAmount.toString(),//"23", // 23 ETH, number
                                                createSpendingPurpose.toString()//"buy foods") // string
                                            )}
                                        >
                                            Create(Admin)
                                        </Button>
                                    </InputAdornment>,
                                }}
                                
                                // value={name}
                                // onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    

                </div>
            </div>


            
            
        </div>
    );
};

export default CompanyScreen;