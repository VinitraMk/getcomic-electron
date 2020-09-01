import React from 'react';
import {CircularProgressbarWithChildren} from 'react-circular-progressbar';



export class CircularProgressBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <CircularProgressbarWithChildren value={this.props.value} className={"gc-progressbar"}>
                <div className="gc-progressbar__icn">
                    <i className="fa fa-times"/>
                </div>
            </CircularProgressbarWithChildren>
        )
    }
}