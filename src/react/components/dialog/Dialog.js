import React from 'react';


export default class Dialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <>
                <div className="gc-dialog">
                    <div className="gc-dialog__content">
                        <div className="gc-dialog__header">
                            {this.props.title}
                        </div>
                        <div className="gc-dialog__body">
                            {this.props.message}
                        </div>
                        <div className="gc-dialog__footer">
                            <button className="gc-btn gc-btn-outline">OK</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}