import React from 'react';
import {CircularProgressbarWithChildren} from 'react-circular-progressbar';



export class CircularProgressBar extends React.Component {
    constructor(props) {
        super(props);
        this.handleProgressClick = this.handleProgressClick.bind(this);
    }

    handleProgressClick() {
        if(this.props.onClick!==undefined) {
            this.props.onClick();
        }
    }

    render() {
        return(
            <CircularProgressbarWithChildren value={this.props.value} className={"gc-progressbar"}>
                <div className="gc-progressbar__icn" onClick={this.handleProgressClick}>
                    <i className="fa fa-times"/>
                </div>
            </CircularProgressbarWithChildren>
        )
    }
}