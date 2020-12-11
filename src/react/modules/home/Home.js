import React from "react";
import Loader from "../../components/loader/Loader";
import {isUrlValid} from "../../utilities/UrlValidators";
import {Results} from "../results/Results";
import {DEFAULT_URL} from "../../constants/AppConstants";
import { titleMatches } from "selenium-webdriver/lib/until";

var scraper = window.scraper;

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url:DEFAULT_URL,
            showLoader:false,
            isUrlInvalid:false,
            urlResponse:"",
            showResults:false,
            issueList:[],
            targetDirectory:""
        }
        this.searchForComics = this.searchForComics.bind(this);
        this.onUrlChange = this.onUrlChange.bind(this);
        this.goToHome = this.goToHome.bind(this);
        this.onTargetChange = this.onTargetChange.bind(this);
        this.targetDirInp = React.createRef();
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
            //console.log(res);
            //console.log(window.scraper,scraper);
            scraper.onSubmit(this.state.url,res.comicName).then(result=>{
                //console.log(result);
                if(result!==null && result.comicName == res.comicName) {
                    this.setState({
                        showLoader:false,
                        showResults:true,
                        issueList:result.issueList
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
                url:e.target.value,
                isUrlInvalid:false
            })
        }
    }

    goToHome() {
        this.setState({
            showResults:false
        })
    }

    onTargetChange(event) {
        console.log('target change clicked',event.target.files);
        let fileName = event.target.files[0].name;
        let filePath = event.target.files[0].path;
        let path = filePath.substring(0,filePath.indexOf(fileName));
        this.setState({
            targetDirectory:path
        });
        //let el = document.querySelector("#targetDirInp");
        document.styleSheets[0].addRule('#targetDireInp:before','content:"'+path+'"');
        console.log(path);
        document.getElementById("targetDirInp").setAttribute("data-filepath",path);
    }

    render() {
        return(
            <>
                {this.state.showResults && <span className="gc-icn gc-icn-back" onClick={this.goToHome}>
                    <i className="fa fa-arrow-left fc--red"></i>
                </span>}
                <div className="gc-container-ac">
                    {!this.state.showResults && <h1 className="gc-root-title">Getcomic</h1>}
                    {!this.state.showResults && <form onSubmit={this.searchForComics} className="m-b-4">
                        <div className={`gc-input-group ${this.state.isUrlInvalid ? "error-input" : ""}`}>
                            <input type="text" className="gc-input-control gc-input-control--search" 
                            placeholder="Enter series or comic issue url here..."
                            value={this.state.url}
                            onChange={this.onUrlChange}/>
                            <button type="submit" className="gc-btn gc-btn-primary">Search</button>
                        </div>
                        {this.state.isUrlInvalid && <span className="error-message">The url is invalid!</span>}
                    </form>}
                    {this.state.showLoader && <Loader message="Fetching Results"/>}
                    {this.state.showResults && <Results issueList={this.state.issueList} targetDirectory={this.state.targetDirectory}/>}
                </div>
            </>
            
        )
    }
}