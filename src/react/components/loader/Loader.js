import React from 'react';


export default class Loader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div className="gc-loader">
            <div className="gc-loader-content">
                <div className="gc-loader__spinner">
                </div>
                <div className="gc-loader__message">
                    {this.props.message}
                </div>
            </div>
        </div>
        )
    }
}