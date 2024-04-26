import React from 'react'
import '../styles/Info.css'
import Message from '../../Message'

export default function Info({infoprop}) {
    const handleClose = () => {
        infoprop(false);
    }

    return (
        <div className="modal">
            <div className="box">                
                <Message />

                <span className="x"><p onClick={handleClose}>close</p></span>
            </div>
        </div>
    )
}