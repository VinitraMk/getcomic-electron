import React from "react";
import Loader from "../../components/loader/Loader";
import {isUrlValid} from "../../utilities/UrlValidators";

var scraper = window.scraper;

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url:"",
            showLoader:false,
            isUrlInvalid:false,
            urlResponse:""
        }
        this.searchForComics = this.searchForComics.bind(this);
        this.onUrlChange = this.onUrlChange.bind(this);
        scraper = window.scraper;
    }


    searchForComics(e) {
        //console.log(this.state.url);
        this.setState({
            showLoader:true
        });
        e.preventDefault();

        let res = isUrlValid(this.state.url);

        if(res.isValid) {
            console.log(res);
            console.log(window.scraper,scraper);
            scraper.onSubmit(this.state.url,res.comicName).then(result=>{
                console.log(result);
                if(result.comicName == res.comicName) {
                    this.setState({
                        showLoader:false
                    });
                }
            });
        }
        else {
            this.setState({
                showLoader:false,
                isUrlInvalid:true
            })
        }
    }

    onUrlChange(e) {
        //console.log(e.target.value);
        if(e.target.value==="") {
            this.setState({
                isUrlInvalid:false,
                url:e.target.value
            })
        }
        else {
            this.setState({
                url:e.target.value
            })
        }
    }

    render() {
        return(
            <div className="gc-container-ac">
                <h1 className="gc-root-title">Getcomic</h1>
                <form onSubmit={this.searchForComics}>
                    <div className={`gc-input-group ${this.state.isUrlInvalid ? "error-input" : ""}`}>
                        <input type="text" className="gc-input-control gc-input-control--search" 
                        placeholder="Enter series or comic issue url here..."
                        value={this.state.url}
                        onChange={this.onUrlChange}/>
                        <button type="submit" className="gc-btn gc-btn-primary">Search</button>
                    </div>
                    {this.state.isUrlInvalid && <span className="error-message">The url is invalid!</span>}
                </form>
                {this.state.showLoader && <Loader message="Fetching Results"/>}
            </div>
        )
    }
}