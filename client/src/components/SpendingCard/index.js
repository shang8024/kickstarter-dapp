import React from 'react';
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

const SpendingCardContent = (props) => {
    const {spending,fmdMinted,index} = props;
    // const [status,setStatus] = React.useState(null);
    // const [loading,setLoading] = React.useState(false);

    // const respondProposal = (approve) => {
    //     setLoading(true);
    //     // do api call
    //     setTimeout(()=>{
    //         setStatus(approve);
    //         setLoading(false);
    //     },3000);
    // }


    return (

        <CardContent>
            <Grid container direction="row" justifyContent="space-between" alignItems="flex-start">
                <Grid item xs>
                    <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                        {(spending.approvalETHCount / fmdMinted * 1000).toFixed(2)}% Approved
                    </Typography>
                </Grid>
                <Grid item xs>
                    <Typography sx={{ fontSize: 18 }} align="right" gutterBottom>
                        {spending.amt} Goerli Ξ
                    </Typography>
                </Grid>
            </Grid>
        </CardContent>
            // <Typography sx={{ mb: 1.5, fontSize: 10 }} color="text.secondary">
            //     Recipient: {spending.receiver}
            // </Typography>
        
            // <Typography variant="h5" component="div">
            //     {spending.purpose}
            // </Typography>
            
        

        // <CardContent>
        //     <div className="card-content">
        //         <div className='title'>
        //             <h2 className="name">Proposal {index}</h2>
        //             <div><a>goerli Ξ</a></div>
        //             <h2 className='number'>{spending.amt}</h2>
        //         </div>
        //         <a>Receiver: {spending.receiver}</a>
        //         <p className="description">{spending.purpose}</p>
        //     </div>
        //     <div className='progress'>
        //         <h3>{spending.approvalETHCount}/{fmdMinted}</h3>
        //     </div>
        //     {/* <div className="card-button-group">
        //         <button className="button" id='reject' onClick={()=>respondProposal('rejected')}>Reject</button>
        //         <button className="button" id='approve' onClick={()=>respondProposal('approved')}>Approve</button>
        //     </div> */}
        // </CardContent>
    );
};

export default SpendingCardContent;