import React from 'react';

const Card = (props) => {
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
                    <h2 className="name">Proposal {props.index}</h2>
                    <h2 className='number'>{props.data.amt}</h2>
                </div>
                <a>Receiver: {props.data.receiver}</a>
                <p className="description">{props.data.purpose}</p>
            </div>
            <div className="card-button-group">
                {loading ? <div className="loader"/>: ((!status) && (!props.data.executed) ?
                    <>
                        <button className="button" id='reject' onClick={()=>respondProposal('rejected')}>Reject</button>
                        <button className="button" id='approve' onClick={()=>respondProposal('approved')}>Approve</button>
                    </>
                : <div className='button-info'><h3>{ (!props.data.executed) ? "You have "+ (props.data.status ? props.data.status : status) + "this proposal." : "Executed"}</h3></div>)
            }
            </div>
        </div>
    );
};

export default Card;