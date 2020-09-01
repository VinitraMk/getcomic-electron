import React from 'react';


export class Grid extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <>
                <table className="gc-table">
                    <thead>
                        <tr>
                            {
                                this.props.columns.map(col=>{
                                    return <th key={"col-"+col.columnHeader}>{col.columnHeader}</th>
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.data.map((rowItem,index)=>{
                                return <tr key={rowItem.rowKey}>
                                    {
                                        this.props.columns.map((column,colInd)=>{
                                            if(column.cellType===undefined || column.cellType==="default") {
                                                return <td key={"col-"+colInd}>{rowItem[column.dataKey]}</td>
                                            }
                                            else if(column.cellType==="action") {
                                                return <td key={"col-"+colInd} width={column.colWidth? column.colWidth:""}>
                                                    {
                                                        column.actionsTemplate(rowItem)
                                                    }
                                                </td>
                                            }
                                        })
                                    }
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </>
        )
    }
}