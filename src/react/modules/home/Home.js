import React from "react";
import Loader from "../../components/loader/Loader";

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url:"",
            showLoader:false
        }
        this.searchForComics = this.searchForComics.bind(this);
        this.onUrlChange = this.onUrlChange.bind(this);
    }

    searchForComics(e) {
        //console.log(this.state.url);
        this.setState({
            showLoader:true
        });
        e.preventDefault();
    }

    onUrlChange(e) {
        //console.log(e.target.value);
        this.setState({
            url:e.target.value
        })
    }

    render() {
        return(
            <div className="gc-container-ac">
                <h1 className="gc-root-title">Getcomic</h1>
                <form onSubmit={this.searchForComics}>
                    <div className="gc-input-group">
                        <input type="text" className="gc-input-control gc-input-control--search" 
                        placeholder="Enter series or comic issue url here..."
                        value={this.state.url}
                        onChange={this.onUrlChange}/>
                        <button type="submit" className="gc-btn gc-btn-primary">Search</button>
                    </div>
                </form>
                {this.state.showLoader && <Loader message="Fetching Results"/>}
            </div>
        )
    }
}