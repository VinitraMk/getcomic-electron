import React from 'react';
import { Grid } from '../../components/grid/Grid';
import { CircularProgressBar } from '../../components/circular-progressbar/CircularProgressBar';
import Dialog from "../../components/dialog/Dialog";
import { SERIES_NAME_NOT_SET_MESSAGE, SERIES_NAME_NOT_SET_TITLE, UNSPECIFIED_TARGET_DIRECTORY_MSG, UNSPECIFIED_TARGET_DIRECTORY_TITLE } from '../../constants/ErrorMessages';
import { DOWNLOAD_STATUS, DOWNLOAD_TYPE } from '../../../shared/constants';
import { FILE_STATUS } from "../../constants/AppConstants";
import * as arrUtils from "../../utilities/ArrayUtils";
var mainProcess = window.mainProcess;

export class Results extends React.Component {

    tableCols=[];
    timeoutVar = null;

    
    constructor(props) {
        super(props);
        this.state = {
            issueTableData:[],
            tableCols: [
                {
                    columnHeader:"Issue Name",
                    dataKey:"issueTitle",
                },
                {
                    columnHeader:"Actions",
                    dataKey:"",
                    cellType:"action",
                    colWidth:"80",
                    actionsTemplate:(row)=>{
                        return row.getTemplate(row);
                    }
                }
            ],
            showErrorDialog:false,
            errorMessage:"",
            errorDialogTitle:"",
        }

        this.prepareTableData = this.prepareTableData.bind(this);
        this.downloadIssue = this.downloadIssue.bind(this);
        this.closeErrorDialog = this.closeErrorDialog.bind(this);
        this.downloadAllIssues = this.downloadAllIssues.bind(this);
        this.viewPdf = this.viewPdf.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }

    componentDidUpdate(prevProps) {
        if(!arrUtils.compareObjects(prevProps.issueList,this.props.issueList)) {
            this.prepareTableData();
        }
    }


    downloadIssue(rowItem) {
        let isTargetDirectoryDefined = this.props.targetDirectory !== "" && this.props.targetDirectory !== null && this.props.targetDirectory !== undefined;
        let isSeriesSetInTarget = this.props.targetDirectory.includes(this.props.seriesName);
        if(isTargetDirectoryDefined && isSeriesSetInTarget) {
            let selectedIssue = this.state.issueTableData.filter(item => item.rowKey === rowItem.rowKey)[0];
            mainProcess.onDownload(
                DOWNLOAD_TYPE.ISSUE,
                this.props.targetDirectory,
                this.props.seriesName,
                [{issueLink:selectedIssue.issueLink,issueName:selectedIssue.issueTitle}],
                ((res)=>{
                    if(res.status==DOWNLOAD_STATUS.INPROGRESS) {
                        let self = this;
                        selectedIssue.getTemplate = (rowItem) => {
                            return <CircularProgressBar value={res.percentage} onClick={()=>{self.cancelDownload(rowItem)}}/>
                        }
                        this.updateRowTemplate(selectedIssue);
                    }
                    else {
                        let self = this;
                        selectedIssue.getTemplate = (rowItem) => {
                            return <button className="gc-btn-link" onClick={()=>{self.viewPdf(rowItem)}}>{FILE_STATUS.READ}</button>
                        }
                        this.updateRowTemplate(selectedIssue);
                    }
                }));
            selectedIssue.getTemplate = (rowItem) => {
                return <CircularProgressBar value={0} onClick={()=>{this.cancelDownload(rowItem)}}/>
            };
            this.updateRowTemplate(selectedIssue);
        } else if(isTargetDirectoryDefined && !isSeriesSetInTarget) {
            this.setState({
                errorMessage: SERIES_NAME_NOT_SET_MESSAGE,
                errorDialogTitle: SERIES_NAME_NOT_SET_TITLE,
                showErrorDialog: true
            });
        }
        else {
            this.setState({
                errorMessage:UNSPECIFIED_TARGET_DIRECTORY_MSG,
                errorDialogTitle:UNSPECIFIED_TARGET_DIRECTORY_TITLE,
                showErrorDialog:true
            })
        }
        
    }


    cancelDownload(rowItem) {
        //let issueList = this.state.issueTableData;
        //console.log('clicked cancel');
        mainProcess.onDownloadCancelled(rowItem.issueTitle, (res) => {
            if (res) {
                let selectedIssue = this.state.issueTableData.filter(item => item.rowKey === rowItem.rowKey)[0];
                selectedIssue.getTemplate = (rowItem) => {
                    return <button className="gc-btn-link" onClick={()=>{this.downloadIssue(rowItem)}}>{FILE_STATUS.DOWNLOAD}</button>
                }
                this.updateRowTemplate(selectedIssue);
            }
        });
    }

    updateRowTemplate(selectedRow) {
        let issueList = this.state.issueTableData;
        issueList.forEach(item=>{
            if(item.rowKey === selectedRow.rowKey) {
                return selectedRow;
            }
        })
        this.setState({
            issueTableData:[...issueList]
        })
    }

    prepareTableData() {
        if(this.props.issueList.length>0) {
            let tableData = this.state.issueTableData;
            let issueList = this.props.issueList;
            issueList.forEach(item=>{
                tableData.push({
                    issueTitle:item.issueTitle,
                    issueLink:item.issueLink,
                    rowKey:"row-"+item.issueTitle,
                    relativeDestination:`/${item.issueTitle}.pdf`,
                    getTemplate:(row) => {
                        if(item.isDownloaded) {
                            return <button className="gc-btn-link" onClick={()=>{this.viewPdf(row)}}>{FILE_STATUS.READ}</button>
                        }
                        else {
                            return <button className="gc-btn-link" onClick={()=>{this.downloadIssue(row)}}>{FILE_STATUS.DOWNLOAD}</button>
                        }
                    }
                })
            });
            this.setState({
                issueTableData:[...tableData]
            });
        }
    }

    closeErrorDialog() {
        this.setState({
            showErrorDialog:false,
            errorMessage:"",
            errorDialogTitle:""
        });
    }

    viewPdf(rowItem) {
        console.log(`${this.props.targetDirectory}${rowItem.relativeDestination}`);
        mainProcess.openInBrowser(`${this.props.targetDirectory}${rowItem.relativeDestination}`);
    }

    downloadAllIssues() {
        this.state.issueTableData.forEach(x => this.downloadIssue(x));
    }

    componentDidUpdate(prevProps) {
        if (prevProps.downloadAllToggler !== this.props.downloadAllToggler) {
            this.downloadAllIssues();
        }
    }

    render() {

        return(
            <>
                <Grid columns={this.state.tableCols} data={this.state.issueTableData}></Grid>
                {this.state.showErrorDialog && <Dialog title={this.state.errorDialogTitle} message={this.state.errorMessage} onDismiss={this.closeErrorDialog}/>}
            </>
        )
    }
}