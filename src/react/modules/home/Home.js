import React from "react";
import Loader from "../../components/loader/Loader";
import {isUrlValid} from "../../utilities/UrlValidators";
import {Results} from "../results/Results";
import {DEFAULT_URL, NO_TD_MSG} from "../../constants/AppConstants";
import { EMPTY_TD_MSG, EMPTY_TD_TITLE } from "../../constants/ErrorMessages";
import Dialog from "../../components/dialog/Dialog";
var mainProcess = window.mainProcess;

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
            targetDirectory:"",
            showErrorDialog:false,
            errorDialogTitle:"",
            errorMessage:"",
            seriesName:""
        }
        this.searchForComics = this.searchForComics.bind(this);
        this.onUrlChange = this.onUrlChange.bind(this);
        this.goToHome = this.goToHome.bind(this);
        this.onTargetChange = this.onTargetChange.bind(this);
        this.closeErrorDialog = this.closeErrorDialog.bind(this);
        this.checkForExistingDownloads = this.checkForExistingDownloads.bind(this);
        this.targetDirInp = React.createRef();
        mainProcess = window.mainProcess;
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
            mainProcess.onSubmit(this.state.url,res.comicName).then(result=>{
                //console.log(result);
                if(result!==null && result.comicName == res.comicName) {
                    this.setState({
                        showLoader:false,
                        showResults:true,
                        issueList:result.issueList,
                        seriesName:res.comicName
                    },()=>{
                        this.checkForExistingDownloads();
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
        if(event.target.files.length>0) {
            let fileName = event.target.files[0].name;
            let filePath = event.target.files[0].path;
            let path = filePath.substring(0,filePath.indexOf(fileName));
            this.setState({
                targetDirectory:path,
            },()=>{
                this.checkForExistingDownloads();
            });
            
        }
        else {
            this.setState({
                showErrorDialog:true,
                errorDialogTitle:EMPTY_TD_TITLE,
                errorMessage:EMPTY_TD_MSG
            });
        }
    }

    closeErrorDialog() {
        this.setState({
            showErrorDialog:false,
            errorDialogTitle:"",
            errorMessage:""
        });
    }

    checkForExistingDownloads() {
        this.setState((prevState)=> {
            return {
                issueList: mainProcess.searchFilesExist(prevState.issueList,`${this.state.targetDirectory}${prevState.seriesName}`)
            }
        })
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
                    {this.state.showResults && 
                        <label className="gc-input-group gc-input-file">
                            <input type="file" 
                            onChange={this.onTargetChange}
                            webkitdirectory="true"
                            />
                            <span className="gc-input-file__action" data-filepath={`${this.state.targetDirectory ? this.state.targetDirectory : NO_TD_MSG}`}></span>
                        </label>
                    }
                    {this.state.showLoader && <Loader message="Fetching Results"/>}
                    {this.state.showResults && <Results seriesName={this.state.seriesName} issueList={this.state.issueList} targetDirectory={this.state.targetDirectory}/>}
                    {this.state.showErrorDialog && <Dialog title={this.state.errorDialogTitle} message={this.state.errorMessage} onDismiss={this.closeErrorDialog}/>}
                </div>
            </>
            
        )
    }
}