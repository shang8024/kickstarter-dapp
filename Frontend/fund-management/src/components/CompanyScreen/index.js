import React from 'react';
import useFundManagement from '../../hooks/useFundManagement.ts';
import Card from '../Card';

const CompanyScreen = (props) => {
    const { 
        connect, 
        currentAccount, 
        projectData, 
        accountData, 
        buyFMDToken, 
        createSpending,
        txHashBuyFMD,
        txHashCreateSpending
    } = useFundManagement();

    console.log(projectData);

    // console.log("CompanyScreen: account = ", currentAccount);
    const [open, setOpen] = React.useState(false);
    const [key, setKey] = React.useState('');
    const [amount, setAmount] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [FMD, setFMD] = React.useState(0);
    const [ETH, setETH] = React.useState(0);

    const slide = (func) => {
        let slider = document.getElementsByClassName('slide-container')[0]
        let cardLen = (window.innerWidth <= 1180) ?
                        0.5*window.innerWidth - 15 :
                        0.3333*window.innerWidth - 10;
        let change = (window.innerWidth <= 1180) ? 2: 3;
        let curCard = Math.round(slider.scrollLeft/cardLen);
        slider.scroll(cardLen * (func(curCard,change)),0);
    };

    const data = {
        companyName: 'Company Name',
        title: 'Title',
        description: 'This is a mock company page. You can subscribe to this company to become a stakeholder. You will be able to see the proposals and vote!',
    }

    const changeFMD = (e) => {
        setFMD(e.target.value);
        setETH(e.target.value * 0.1);
        if (FMD<1){
            e.target.reportValidity();
            e.target.setCustomValidity('Please enter a number greater than or equal to 1');
        }else{
            e.target.setCustomValidity('');
        }
    }

    return (
        <div id="page-wrapper">
            <div id='header-wrapper'>
                <header className='container'>
                    <div id='logo'>
                        <h1><a href='#'>{data.companyName}</a></h1>
                    </div>
                </header>
            </div>
            <div id="main-wrapper">
                <div className='container'>
                    <article>
                        <h2>{data.title}</h2>
                        <p className="company-description">{data.description}</p>
                    </article>
                    <div id='subscription-wrapper'>
                        <button 
                            className='button' 
                            onClick={connect}>
                            <span>{currentAccount ? 'Connected' : 'Connect to MetaMask'}</span>
                        </button>
                        <div className='button-input-group'>
                            <div className='group'>
                                <div className='group input-group'>
                                    <label>FMD:</label>
                                    <input
                                        type='number'
                                        placeholder='FMD'
                                        className='inputfield'
                                        min={1}
                                        value={FMD}
                                        onChange={(e)=>changeFMD(e)}
                                    />
                                </div>
                            <div className='icon'>&#8595;</div>
                                <div className='group input-group'>
                                    <label>ETH:</label>
                                    <input
                                    type='number'
                                    placeholder='ETH'
                                    className='inputfield'
                                    disabled
                                    min={0}
                                    value={ETH}
                                    />
                                </div>
                            </div>
                            
                        <button
                            className='button'
                            // this button only shows when the user is connected
                            // if currentAccount.toUpperCase() !== projectProfile.admin.toUpperCase()
                            //    disable button showing your are not project admin
                            onClick={() => buyFMDToken(ETH) // 0.1 ETH is minimum amount
                            }>
                            <span>{"exchangebutton"}</span>
                        </button>
                        <div id='subscription-info'>
                            {!txHashBuyFMD ? null : <p>TxHash: {txHashBuyFMD.hash}</p>}
                            {!txHashBuyFMD ? null : <p>TxHash: <a href={'https://goerli.etherscan.io/tx/'+txHashBuyFMD.hash}>{txHashBuyFMD.hash}</a></p>}
                        </div>
                        </div>
                        <button
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
                        </button>
                        <div id='subscription-info'>
                            {!currentAccount ? null : <p>Address: { currentAccount }</p>}
                        </div>
                    </div>
                </div>
            </div>
            { currentAccount &&
            <div className='slider'>
                <button className='slide-prev button' onClick={()=>slide((a,b)=>a-b)}>&#8249;</button>
                <div className="slide-container rootClass" >
                    <div className="slide-content">
                        {projectData && accountData.approvals.map((s,index) => <Card key={index.toString()} index={index} spending={projectData.spending[s]} fmdMinted={projectData.fmdMinted}/>)}
                    </div>
                </div>
                <button className='slide-next button' onClick={()=>slide((a,b)=>a+b)}>&#8250;</button>
            </div>
            }
        </div>
    );
};

export default CompanyScreen;