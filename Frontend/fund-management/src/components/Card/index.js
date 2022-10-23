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
                <h2 className="name">{props.data.title}</h2>
                <p className="description">{props.data.description}</p>
            </div>
            <div className="card-button-group">
                {loading ? <div className="loader"/>: ((!status) && (!props.data.status) ?
                    <>
                        <button className="button" id='reject' onClick={()=>respondProposal('rejected')}>Reject</button>
                        <button className="button" id='approve' onClick={()=>respondProposal('approved')}>Approve</button>
                    </>
                : <div className='button-info'><h3>You have {props.data.status? props.data.status : status} this proposal.</h3></div>)
            }
            </div>
        </div>
    );
};

export default Card;