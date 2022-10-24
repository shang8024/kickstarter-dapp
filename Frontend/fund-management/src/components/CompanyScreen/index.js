import React from 'react';
import useFundManagement from '../../hooks/useFundManagement.ts';
import Card from '../Card';
import { 
    CircularProgress, 
    TextField,
    Grid,
    Button,
    Divider
    // Card
} from '@mui/material';
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
        setTxReturnFMD
    } = useFundManagement();

    // console.log(projectData);

    // console.log("CompanyScreen: account = ", currentAccount);
    const [open, setOpen] = React.useState(false);
    const [key, setKey] = React.useState('');
    const [amount, setAmount] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [buyFMD, setBuyFMD] = React.useState(0);
    const [returnFMD, setReturnFMD] = React.useState(0);
    const [ETH, setETH] = React.useState(0);

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
        setETH(e.target.value * 0.1);
    }

    const changeETH = (e) => {
        if (e.target.value < 0.1){
            e.target.reportValidity();
            e.target.setCustomValidity('Please enter a number greater than or equal to 1');
            e.target.value = 0.1;
        }else{
            e.target.setCustomValidity('');
        }
        setETH(e.target.value);
        setBuyFMD(e.target.value * 10);
    }

    const sentBuyFMD = (e) => {
        if (buyFMD < 1) {
            // fmdInput.current.reportValidity();
            // fmdInput.current.setCustomValidity('Please enter a number greater than or equal to 1');
            return;
        }
        buyFMDToken(ETH.toString());
    }

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

    return (

        <div id="page-wrapper">
            <div id='header-wrapper'>
                <header className='container'>
                    <div id='logo'>
                        <h1><a href='#'>Kickstarter</a></h1>
                    </div>
                    <button
                        className='button'
                        onClick={connect}>
                        <span>{currentAccount ? 'Connected' : 'Connect to MetaMask'}</span>
                    </button>
                    <div id='subscription-info'>
                        {!currentAccount ? null : <p>Address: {currentAccount}</p>}
                    </div>
                </header>
            </div>
            <div id="main-wrapper">
                <div className='container'>
                    <Grid container spacing={2}>
                        <Grid item xs={6} >
                            <h2>Project Profile:</h2>
                            Admin: {projectData && projectData.admin}
                            <br/>
                            FMD Token Address: {projectData && projectData.shareTokenAddress}
                            <br/>
                            buyFMD Minted: {projectData && projectData.fmdMinted}
                            <br/>
                            MinbuyETH: {projectData && projectData.minBuyETH}
                            <br/>
                            spendingIdCounter: {projectData && projectData.spendingIdCounter}
                            <br/>
                        </Grid>
                        <Grid item xs={6} >
                            <h2>Account Profile:</h2>
                            buyFMD Balance: {accountData && accountData.fmdBalance}
                            <br/>
                            ETH Balance: {accountData && accountData.ethBalance}
                            <br/>
                            Is Admin: {projectData && (currentAccount.toUpperCase() == projectData.admin.toUpperCase()).toString()}
                        </Grid>
                    </Grid>
                </div>  
            </div>

            <br/>

            <div id="main-wrapper">
                <div className='container'>
                            BuyFMD
                            <div className='group input-group'>
                                <label>buyFMD:</label>
                                <input
                                    type='number'
                                    placeholder='buyFMD'
                                    className='inputfield'
                                    min={1}
                                    // ref={fmdInput}
                                    value={buyFMD}
                                    onChange={e => changeFMD(e)}
                                />
                            </div>
                            {/* <div className='icon'>&#8595;</div> */}
                            <div className='group input-group'>
                                <label>ETH:</label>
                                <input
                                    type='number'
                                    placeholder='ETH'
                                    className='inputfield'
                                    min={0.1}
                                    value={ETH}
                                    onChange={e => changeETH(e)}
                                />
                            </div>
                            <button
                                className='button'
                                // this button only shows when the user is connected
                                // if currentAccount.toUpperCase() !== projectProfile.admin.toUpperCase()
                                //    disable button showing your are not project admin
                                onClick={(e) => sentBuyFMD(e)}>
                                <span>{"BuyFMD"}</span>
                            </button>
                            <div id='subscription-info'>
                                {!txBuyFMD ? null : !txBuyFMD.status ? <CircularProgress size="1rem" /> : <CircularProgress variant="determinate" size="1rem" value={100} />}
                                {!txBuyFMD ? null : <a href={'https://goerli.etherscan.io/tx/' + txBuyFMD.hash}>{txBuyFMD.hash}</a>}
                            </div>

                            Return FMD
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
                                                    <CircularProgress size="0.5rem" />
                                                    &emsp;&emsp;
                                                    <a href={'https://goerli.etherscan.io/tx/' + txReturnFMD.hash}>{txReturnFMD.hash}</a>
                                                </div>
                                                :
                                                <div>
                                                    <CircularProgress variant="determinate" size="0.5rem" value={100} /> 
                                                    &emsp;&emsp;
                                                    <a href={'https://goerli.etherscan.io/tx/' + txReturnFMD.hash}>{txReturnFMD.hash}</a>
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
                                            endAdornment: <InputAdornment position="end">Goerli Ξ</InputAdornment>,
                                        }}
                                        helperText={
                                            !txCreateSpending ? null :
                                                !!txCreateSpending.errorMsg ?
                                                    <span style={{ color: 'red' }}>{txCreateSpending.errorMsg}</span>
                                                    :
                                                    !txCreateSpending.status ?
                                                        <div>
                                                            <CircularProgress size="0.5rem" />
                                                            &emsp;&emsp;
                                                            <a href={'https://goerli.etherscan.io/tx/' + txCreateSpending.hash}>{txCreateSpending.hash}</a>
                                                        </div>
                                                        :
                                                        <div>
                                                            <CircularProgress variant="determinate" size="0.5rem" value={100} />
                                                            &emsp;&emsp;
                                                            <a href={'https://goerli.etherscan.io/tx/' + txCreateSpending.hash}>{txCreateSpending.hash}</a>
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
                                                >Create</Button>
                                            </InputAdornment>,
                                        }}
                                        
                                        // value={name}
                                        // onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                            
                            
                            
                            {/* <Card variant="outlined">{"s"}</Card> */}
                            {/* <button
                                className='button'
                                // this button only shows when the user is connected
                                // if currentAccount.toUpperCase() !== projectProfile.admin.toUpperCase()
                                //    disable button showing your are not project admin
                                onClick={() => createSpending(
                                    "0xDBEFE09D505fEd9E236586b41Db39f5F0D55d49f", // must be wallet address
                                    "23", // 23 ETH, number
                                    "buy foods") // string
                                }>
                                <span>{"create spending"}</span>
                            </button> */}
                     
                </div>
            </div>

            { currentAccount &&
                <div className='slider'>
                    <button className='slide-prev button' onClick={()=>slide((a,b)=>a-b)}>&#8249;</button>
                    <div className="slide-container rootClass" >
                        <div className="slide-content">
                            {   
                                projectData && accountData.approvals.map((s,index) => 
                                    <Card 
                                        key={index.toString()} index={index} 
                                        spending={projectData.spending[index]} 
                                        fmdMinted={projectData.fmdMinted}/
                                    >
                                )
                            }
                        </div>
                    </div>
                    <button className='slide-next button' onClick={()=>slide((a,b)=>a+b)}>&#8250;</button>
                </div>
            }
        </div>
    );
};

export default CompanyScreen;