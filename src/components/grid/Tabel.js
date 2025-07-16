import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button, Tooltip } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined, UploadOutlined, EyeOutlined } from "@ant-design/icons";

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
    const [expandedRows, setExpandedRows] = useState({});

    const defaultColDef = useMemo(() => ({
        flex: 1,
        resizable: true,
        sortable: sortCol,
        filter: filter,
        minWidth: 160,
        cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
        },
        headerClass: "ag-center-cols-header",
    }), [sortCol, filter]);

    const filteredRows = useMemo(() => {
        if (!searchText) return rowData;

        return rowData.filter((row) => {
            const textContent = [
                ...Object.values(row),
                ...(Array.isArray(row.attachmentLinks)
                    ? row.attachmentLinks.map(f => f.fileName)
                    : []),
            ]
                .filter((val) => typeof val === "string")
                .join(" ")
                .toLowerCase();

            return textContent.includes(searchText.toLowerCase());
        });
    }, [searchText, rowData]);

    const toggleExpand = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleSearchInput = useCallback((e) => {
        setSearchText(e.target.value);
    }, []);

    return (
        <div className="w-full flex flex-col gap-6">
            <div
                className="flex justify-between items-center gap-3 flex-col sm:flex-row"
                style={{ marginBottom: "0.5rem" }}
            >
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
                            width: "400px",
                            marginRight: "1rem",
                        }}
                    />
                )}
            </div>

            <div className="ag-theme-alpine" style={{ width: "100%" }}>
                {filteredRows.map((row) => (
                    <div key={row.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingInline: 12 }}>
                            <Button
                                type="text"
                                icon={
                                    expandedRows[row.id] ? <MinusSquareOutlined /> : <PlusSquareOutlined />
                                }
                                onClick={() => toggleExpand(row.id)}
                            />
                            {columnDefs.map((col, index) => (
                                <div key={index} style={{ minWidth: col.minWidth || 120 }}>
                                    {row[col.field] ?? "—"}
                                </div>
                            ))}
                        </div>

                        {expandedRows[row.id] && (
                            <div style={{ padding: "12px 40px", background: "#fafafa" }}>
                                <div style={{ marginBottom: 8 }}>
                                    <Button
                                        type="dashed"
                                        icon={<UploadOutlined />}
                                        onClick={() => console.log("📤 آپلود فایل جدید برای سند:", row.id)}
                                    >
                                        بارگذاری فایل جدید
                                    </Button>
                                </div>

                                <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: "12px" }}>
                                    <table style={{ width: "100%", fontSize: "0.9rem" }}>
                                        <thead>
                                        <tr style={{ background: "#f0f0f0", textAlign: "center" }}>
                                            <th>نام فایل</th>
                                            <th>فرمت</th>
                                            <th>پیش‌نمایش</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {(row.attachmentLinks ?? []).map((file) => (
                                            <tr key={file.id} style={{ textAlign: "center" }}>
                                                <td>{file.fileName}</td>
                                                <td>{file.extension}</td>
                                                <td>
                                                    <Tooltip title="مشاهده فایل">
                                                        <Button
                                                            type="link"
                                                            icon={<EyeOutlined />}
                                                            href={`/api/attachments/${row.id}/preview/${file.id}`}
                                                            target="_blank"
                                                        />
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        ))}
                                        {row.attachmentLinks?.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: "center", color: "#999" }}>
                                                    هیچ فایلی ثبت نشده است
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tabel;
