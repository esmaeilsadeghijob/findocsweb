import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, ExcelExportModule } from "ag-grid-enterprise";

import TabelOptionLeft from "./components/TabelOptionLeft.js";
import TabelOptionRight from "./components/TabelOptionRight.js";
import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ExcelExportModule
]);

const Tabel = ({
                   rowData,
                   columnDefs,
                   actionElement,
                   actionElement2,
                   sortCol = false,
                   excel = true,
                   csv = false,
                   filter = true,
                   search = true,
                   styles = "",
                   showAll = false,
                   optionCol = true,
                   onFilterTextBoxChanged,
                   detailCellRendererFramework,
                   detailRowHeight,
                   getRowNodeId
               }) => {
    const gridRef = useRef(null);
    const [gridApi, setGridApi] = useState(null);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        resizable: true,
        sortable: true,
        minWidth: 160,
    }), []);

    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const onGridReady = useCallback((params) => {
        setGridApi(params.api);
    }, []);

    const resetFilters = useCallback(() => {
        const input = document.getElementById("table-search");
        if (input) input.value = "";
        if (!gridApi) return;
        gridApi.setFilterModel(null);
        gridApi.onFilterChanged();
    }, [gridApi]);

    return (
        <div className={`w-full flex flex-col gap-3.5 ${styles}`}>
            <div className={`w-full flex items-center justify-between gap-3 ${optionCol ? 'flex-col-reverse' : ''} sm:flex-row`}>
                <TabelOptionRight
                    search={search}
                    onFilterTextBoxChanged={onFilterTextBoxChanged}
                    actionElement2={actionElement2}
                />
                <TabelOptionLeft
                    csv={csv}
                    excel={excel}
                    filter={filter}
                    gridApi={gridApi}
                    optionCol={optionCol}
                    resetFilters={resetFilters}
                    actionElement={actionElement}
                />
            </div>
            <div style={gridStyle}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    enableRtl={true}
                    domLayout="autoHeight"
                    pagination={true}
                    localeText={AG_GRID_LOCALE_IR}
                    gridOptions={{ defaultColDef: { sortable: sortCol } }}
                    paginationPageSize={showAll ? Math.max(rowData.length || 0, 1) : 10}
                    paginationPageSizeSelector={showAll ? [rowData.length || 0] : [10, 25, 50]}
                    animateRows={true}
                    onGridReady={onGridReady}
                    detailCellRendererFramework={detailCellRendererFramework}
                    detailRowHeight={detailRowHeight}
                    getRowNodeId={getRowNodeId}
                />
            </div>
        </div>
    );
};

export default Tabel;
