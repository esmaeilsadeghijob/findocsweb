import React, { useCallback, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const Tabel = ({
                   columnDefs,
                   rowData,
                   actionElement,
                   sortCol = false,
                   search = true,
                   excel = true,
                   csv = true,
                   filter = true,
               }) => {
    const [searchText, setSearchText] = useState("");

    const defaultColDef = useMemo(() => ({
        flex: 1,
        resizable: true,
        sortable: sortCol,
        filter: filter,
        minWidth: 160,
    }), [sortCol, filter]);

    // 🔍 فیلتر دیتا طبق متن سرچ
    const filteredRows = useMemo(() => {
        if (!searchText) return rowData;
        return rowData.filter((row) =>
            Object.values(row).some(
                (val) =>
                    typeof val === "string" &&
                    val.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, rowData]);

    const handleSearchInput = useCallback((e) => {
        setSearchText(e.target.value);
    }, []);

    return (
        <div className="w-full flex flex-col gap-3.5">
            <div className="flex justify-between items-center gap-3 flex-col sm:flex-row">
                {actionElement}
                {search && (
                    <input
                        value={searchText}
                        onChange={handleSearchInput}
                        placeholder="جست‌وجو..."
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            fontSize: "13px",
                            width: "250px",
                        }}
                    />
                )}
            </div>

            <div className="ag-theme-alpine" style={{width: "100%", minHeight: "400px"}}>
                <AgGridReact
                    rowData={filteredRows}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    domLayout="autoHeight"
                    animateRows={true}
                />
            </div>
        </div>
    );
};

export default Tabel;
