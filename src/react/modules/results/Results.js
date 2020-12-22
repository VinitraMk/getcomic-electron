import React from 'react';
import { Grid } from '../../components/grid/Grid';
import { CircularProgressBar } from '../../components/circular-progressbar/CircularProgressBar';
import Dialog from "../../components/dialog/Dialog";
import { UNSPECIFIED_TARGET_DIRECTORY_MSG, UNSPECIFIED_TARGET_DIRECTORY_TITLE } from '../../constants/ErrorMessages';
import { DOWNLOAD_STATUS, DOWNLOAD_TYPE } from '../../../shared/constants';

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
        this.viewPdf = this.viewPdf.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }


    downloadIssue(rowItem) {
        if(this.props.targetDirectory!=="") {
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
                            return <button className="gc-btn-link" onClick={()=>{self.viewPdf(rowItem)}}>View</button>
                        }
                        this.updateRowTemplate(selectedIssue);
                    }
                }));
            selectedIssue.getTemplate = (rowItem) => {
                return <CircularProgressBar value={0} onClick={()=>{this.cancelDownload(rowItem)}}/>
            };
            this.updateRowTemplate(selectedIssue);
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
        let selectedIssue = this.state.issueTableData.filter(item => item.rowKey === rowItem.rowKey)[0];

        selectedIssue.getTemplate = (rowItem) => {
            return <button className="gc-btn-link" onClick={()=>{this.downloadIssue(rowItem)}}>Download</button>
        }

        this.updateRowTemplate(selectedIssue);
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
                    relativeDestination:`${this.props.seriesName}/${item.issueTitle}.pdf`,
                    getTemplate:(row) => {
                        return <button className="gc-btn-link" onClick={()=>{this.downloadIssue(row)}}>Download</button>
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

    render() {

        return(
            <>
                <Grid columns={this.state.tableCols} data={this.state.issueTableData}></Grid>
                {this.state.showErrorDialog && <Dialog title={this.state.errorDialogTitle} message={this.state.errorMessage} onDismiss={this.closeErrorDialog}/>}
            </>
        )
    }
}