const Dialog = (props) => {

    return (
        <>
        {props.open ?
        <div className="dialog" >
            <div className='dialogContainer'>
                <i className="ico-times" id='dialogCancel' role="img" aria-label="Cancel" onClick={()=>{props.closeDialog()}}></i>
                {props.children}
            </div>
            <div className="dialogBackground" onClick={()=>props.closeDialog()}/>
        </div> : null}
        </>
    );
}

export default Dialog;