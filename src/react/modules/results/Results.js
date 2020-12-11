import React from 'react';
import { Grid } from '../../components/grid/Grid';
import { CircularProgressBar } from '../../components/circular-progressbar/CircularProgressBar';
import Dialog from "../../components/dialog/Dialog";
import { UNSPECIFIED_TARGET_DIRECTORY_MSG, UNSPECIFIED_TARGET_DIRECTORY_TITLE } from '../../constants/ErrorMessages';

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
                        //if(row.currentAction ==="button") {
                            //return <button className="gc-btn-link" onClick={()=>this.downloadIssue(row)}>Download</button>
                        //}
                        //else if(row.currentAction === "progress") {
                            //return <CircularProgressBar value={row.actionData.value}/>
                        //}
                    }
                }
            ],
            showErrorDialog:false,
            errorMessage:"",
            errorDialogTitle:""
        }

        this.prepareTableData = this.prepareTableData.bind(this);
        this.downloadIssue = this.downloadIssue.bind(this);
        this.closeErrorDialog = this.closeErrorDialog.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }

    downloadIssue(rowItem) {
        //console.log('download clicked',rowItem);
        //let issueList = this.state.issueTableData;
        

        if(this.props.targetDirectory==="") {
            this.setState({
                showErrorDialog:true,
                errorDialogTitle:UNSPECIFIED_TARGET_DIRECTORY_TITLE,
                errorMessage:UNSPECIFIED_TARGET_DIRECTORY_MSG
            })
        }
        else {
            let selectedIssue = this.state.issueTableData.filter(item => item.rowKey === rowItem.rowKey)[0];
            selectedIssue.getTemplate = (rowItem) => {
                return <CircularProgressBar value={0} onClick={()=>{this.cancelDownload(rowItem)}}/>
            };
            this.updateRowTemplate(selectedIssue);
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

    render() {

        return(
            <>
                <Grid columns={this.state.tableCols} data={this.state.issueTableData}></Grid>
                {this.state.showErrorDialog && <Dialog title={this.state.errorDialogTitle} message={this.state.errorMessage} onDismiss={this.closeErrorDialog}/>}
            </>
        )
    }
}