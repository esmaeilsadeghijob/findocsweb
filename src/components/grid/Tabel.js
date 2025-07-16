import React, { useCallback, useMemo, useRef } from "react";
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
    const gridRef = useRef(null);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        resizable: true,
        sortable: sortCol,
        minWidth: 160,
        filter: filter, // ✅ فعال‌سازی فیلتر به‌صورت boolean نه string
    }), [sortCol, filter]);

    const onQuickFilterChange = useCallback((event) => {
        const value = event.target.value;
        if (gridRef.current && gridRef.current.api && typeof gridRef.current.api.setQuickFilter === "function") {
            gridRef.current.api.setQuickFilter(value);
        }
    }, []);

    return (
        <div className="w-full flex flex-col gap-3.5">
            <div className="flex justify-between items-center gap-3 flex-col sm:flex-row">
                {search && (
                    <input
                        id="table-search"
                        placeholder="جست‌وجو..."
                        onInput={onQuickFilterChange}
                        style={{
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            fontSize: "13px",
                            width: "250px",
                        }}
                    />
                )}
                {actionElement}
            </div>

            <div className="ag-theme-alpine" style={{ width: "100%", minHeight: "400px" }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
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
