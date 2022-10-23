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

    // console.log("CompanyScreen: account = ", currentAccount);
    const [open, setOpen] = React.useState(false);
    const [key, setKey] = React.useState('');
    const [amount, setAmount] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');



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
        cards: [
            {
                title: 'Proposal 1',
                description: 'Thiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa a as is a mock proposal. You can vote for this proposal to support it. ',
                status: null,
            },
            {
                title: 'Proposal 2',
                description: 'Thiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa a as is a mock proposal. You can vote for this proposal to support it. Thiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa a as is a mock proposal. You can vote for this proposal to support ',
                status: 'rejected',
            },
            {
                title: 'Proposal 3',
                description: 'This is a mock proposal. You can vote for this proposal to support it.',
                status: 'approved',
            },
            {
                title: 'Proposal 4',
                description: 'This is a mock proposal. You can vote for this proposal to support it.',
                status: null,
            },{
                title: 'Proposal 5',
                description: 'This is a mock proposal. You can vote for this proposal to support it.',
                status: 'approved',
            },{
                title: 'Proposal 6',
                description: 'This is a mock proposal. You can vote for this proposal to support it.',
                status: 'approved',
            },
            {
                title: 'Proposal 7',
                description: 'This is a mock proposal. You can vote for this proposal to support it.',
                status: 'approved',
            },
        ]
    }

    const closeDialog = () => {
        if (!loading) {
            setOpen(false);
            setMessage('');
        }
    }
    const subscribe = () => {
        setMessage('');
        setLoading(true);
        // do api call
        //sleep for 10 sec
        setTimeout(()=>{
            setLoading(false);
            setMessage('Successed!');
        },3000);
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
                        <button
                            className='button'
                            // this button only shows when the user is connected
                            // if currentAccount.toUpperCase() !== projectProfile.admin.toUpperCase()
                            //    disable button showing your are not project admin
                            onClick={() => buyFMDToken(
                                "0.1") // 0.1 ETH is minimum amount
                            }>
                            <span>{"exchangebutton"}</span>
                        </button>
                        <div id='subscription-info'>
                            {!txHashBuyFMD ? null : <p>TxHash: {txHashBuyFMD.hash}</p>}
                            {!txHashBuyFMD ? null : <p>Finished: {txHashBuyFMD.status}</p>}
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