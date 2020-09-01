import React from 'react';
import { Grid } from '../../components/grid/Grid';
import { titleIs } from 'selenium-webdriver/lib/until';
import { CircularProgressBar } from '../../components/circular-progressbar/CircularProgressBar';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';

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
            ]
        }

        this.prepareTableData = this.prepareTableData.bind(this);
        this.downloadIssue = this.downloadIssue.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }

    downloadIssue(rowItem) {
        //console.log('download clicked',rowItem);
        //let issueList = this.state.issueTableData;
        let selectedIssue = this.state.issueTableData.filter(item => item.rowKey === rowItem.rowKey)[0];

        selectedIssue.getTemplate = (rowItem) => {
            return <CircularProgressBar value={0} onClick={()=>this.cancelDownload(rowItem)}/>
        }

        this.updateRowTemplate(selectedIssue);

        this.updateProgress(rowItem);
    }

    updateProgress(rowItem) {
        console.log('in update progress');
        setTimeout(() => {
            console.log('inside interval');
            let val = rowItem.value;
            if(val===100) {
                let selectedIssue = this.state.issueTableData.filter(item => item.rowKey === rowItem.rowKey)[0];
                selectedIssue.getTemplate = (rowItem) => {
                    return <span>Download Complete!</span> 
                }
            }
            else {
                val += 25;
                let selectedIssue = this.state.issueTableData.filter(item => item.rowKey === rowItem.rowKey)[0];
                selectedIssue.getTemplate = (rowItem) => {
                    return <CircularProgressBar value={val} onClick={()=>this.cancelDownload(rowItem)}/>
                }

                this.updateRowTemplate(selectedIssue);
                
            }
        },3000,this.updateProgress,rowItem);
    }

    cancelDownload(rowItem) {
        //let issueList = this.state.issueTableData;
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

    render() {

        return(
            <>
                <Grid columns={this.state.tableCols} data={this.state.issueTableData}></Grid>
            </>
        )
    }
}