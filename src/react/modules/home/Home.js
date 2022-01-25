import React from "react";
import Loader from "../../components/loader/Loader";
import {isUrlValid} from "../../utilities/UrlValidators";
import {Results} from "../results/Results";
import { DEFAULT_URL } from "../../constants/AppConstants";
import Dialog from "../../components/dialog/Dialog";
import { join } from 'path';
import { CHECKING_FOR_DOWNLOADS_MSG, FETCHING_RESULTS_MESSAGE } from "../../../shared/constants";
import { UNSPECIFIED_TARGET_DIRECTORY_MSG, UNSPECIFIED_TARGET_DIRECTORY_TITLE } from "../../constants/ErrorMessages";

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
            seriesName:"",
            loaderMessage: FETCHING_RESULTS_MESSAGE,
            downloadAllToggler: true,
            isDownloadAllEnabled: true
        }
        this.searchForComics = this.searchForComics.bind(this);
        this.onUrlChange = this.onUrlChange.bind(this);
        this.goToHome = this.goToHome.bind(this);
        this.onTargetChange = this.onTargetChange.bind(this);
        this.closeErrorDialog = this.closeErrorDialog.bind(this);
        this.checkForExistingDownloads = this.checkForExistingDownloads.bind(this);
        this.setTargetDirectory = this.setTargetDirectory.bind(this);
        this.downloadAll = this.downloadAll.bind(this);
        this.targetDirInp = React.createRef();
        mainProcess = window.mainProcess;
    }



    searchForComics(e) {
        //console.log(this.state.url);
        this.setState({
            showLoader:true,
            loaderMessage: FETCHING_RESULTS_MESSAGE
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
            showResults:false,
            issueList: [],
            targetDirectory: ""
        })
    }

    onTargetChange(event) {
        this.setState({
            targetDirectory: event.target.value
        })
    }

    setTargetDirectory() {
        let pathname = this.state.targetDirectory;
        if (pathname !== "" && !pathname.includes(this.state.seriesName)) {
            this.setState((prevState) => ({
                targetDirectory: join(pathname, prevState.seriesName),
                showLoader: true,
                loaderMessage: CHECKING_FOR_DOWNLOADS_MSG
            }));
            this.checkForExistingDownloads();
        } else if (pathname === "") {
            this.setState({
                showErrorDialog: true,
                errorDialogTitle: UNSPECIFIED_TARGET_DIRECTORY_TITLE,
                errorMessage: UNSPECIFIED_TARGET_DIRECTORY_MSG
            })
        } else {
            this.checkForExistingDownloads();
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
        if (this.state.targetDirectory !== "") {
            this.setState((prevState)=> {
                return {
                    issueList: mainProcess.searchFilesExist(prevState.issueList,`${prevState.targetDirectory}`),
                }
            }, () => {
                this.setState(prevState => ({
                    showLoader: false,
                    loaderMessage: "",
                    isDownloadAllEnabled: prevState.issueList.filter(x => x.isDownloaded === true).length !== prevState.issueList.length
                }));
            });
        }
    }

    downloadAll() {
        this.setState(prevState => ({
            downloadAllToggler: !prevState.downloadAllToggler
        }));
    }

    render() {
        return(
            <>
                {this.state.showResults && <span className="gc-icn gc-icn-back" onClick={this.goToHome}>
                    <i className="fa fa-arrow-left fc--red"></i>
                </span>}
                <div className="gc-container-ct">
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
                    <>
                        <div className={`gc-input-group m-b-4`}>
                            <input type="text" className="gc-input-control gc-input-control--search" 
                            placeholder="Enter target directory path here"
                            value={this.state.targetDirectory}
                            onChange={this.onTargetChange}/>
                            <button type="button" onClick={this.setTargetDirectory} className="gc-btn gc-btn-primary">Set Target Directory</button>
                        </div>
                        <div className="w-100 text-right m-b-4">
                            {this.state.isDownloadAllEnabled && <button className="gc-btn-link" onClick={this.downloadAll}>Download All</button>}
                        </div>
                    </>
                    }
                    {this.state.showLoader && <Loader message={this.state.loaderMessage} />}
                    {this.state.showResults && <Results seriesName={this.state.seriesName} issueList={this.state.issueList} targetDirectory={this.state.targetDirectory} downloadAllToggler={this.state.downloadAllToggler}/>}
                    {this.state.showErrorDialog && <Dialog title={this.state.errorDialogTitle} message={this.state.errorMessage} onDismiss={this.closeErrorDialog}/>}
                </div>
            </>
            
        )
    }
}