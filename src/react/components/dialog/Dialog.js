import React from 'react';


export default class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.onClose = this.onClose.bind(this);
    }

    onClose() {
        this.props.onDismiss();
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
                            <button className="gc-btn gc-btn-outline gc-btn--sm" onClick={this.onClose}>OK</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}