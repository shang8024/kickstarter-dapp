import React from 'react';

const Card = (props) => {
    const {spending,fmdMinted,index} = props;
    const [status,setStatus] = React.useState(null);
    const [loading,setLoading] = React.useState(false);

    const respondProposal = (approve) => {
        console.log(status);
        setLoading(true);
        // do api call
        setTimeout(()=>{
            setStatus(approve);
            setLoading(false);
        },3000);
    }

    return (
        <div className="card flex-none">
            <div className="card-content">
                <div className='title'>
                    <h2 className="name">Proposal {index}</h2>
                    <div><a>goerli Ξ</a></div>
                    <h2 className='number'>{spending.amt}</h2>
                </div>
                <a>Receiver: {spending.receiver}</a>
                <p className="description">{spending.purpose}</p>
            </div>
            <div className='progress'>
                <h3>{spending.approvalETHCount}/{fmdMinted}</h3>
            </div>
            <div className="card-button-group">
                {loading ? <div className="loader"/>: ((!status) && (!spending.executed) ?
                    <>
                        <button className="button" id='reject' onClick={()=>respondProposal('rejected')}>Reject</button>
                        <button className="button" id='approve' onClick={()=>respondProposal('approved')}>Approve</button>
                    </>
                : <div className='button-info'><h3>{ (!spending.executed) ? "You have "+ {status} + " this proposal." : "Executed"}</h3></div>)
            }
            </div>
        </div>
    );
};

export default Card;