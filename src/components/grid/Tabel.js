import React, {useCallback, useMemo, useState, useEffect} from "react";
import {
    Button,
    Tooltip,
    message,
} from "antd";
import {
    PlusSquareOutlined,
    MinusSquareOutlined,
    UploadOutlined,
    EyeOutlined,
    DeleteOutlined, CloseOutlined,
} from "@ant-design/icons";
import UploadModal from "./UploadModal";
import {getAttachments, deleteAttachment} from "../../api/api";

const Tabel = ({
                   columnDefs,
                   rowData,
                   actionElement,
                   sortCol = false,
                   search = true,
                   excel = true,
                   csv = true,
                   filter = true,
                   onRefreshRowData,
               }) => {
    const [searchText, setSearchText] = useState("");
    const [expandedRows, setExpandedRows] = useState({});
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [internalRows, setInternalRows] = useState(rowData);

    useEffect(() => {
        setInternalRows(rowData);
    }, [rowData]);

    useEffect(() => {
        if (!searchText) {
            setExpandedRows({});
            return;
        }

        const normalizedSearch = searchText.toLowerCase();
        const autoExpanded = {};
        rowData.forEach((row) => {
            const fileMatch = (row.attachmentLinks ?? []).some((file) =>
                Object.values(file)
                    .filter((val) => typeof val === "string")
                    .some((text) => text.toLowerCase().includes(normalizedSearch))
            );
            if (fileMatch) {
                autoExpanded[row.id] = true;
            }
        });

        setExpandedRows(autoExpanded);
    }, [searchText, rowData]);

    const filteredRows = useMemo(() => {
        if (!searchText) return internalRows;
        const normalizedSearch = searchText.toLowerCase();

        return internalRows.filter((row) => {
            const baseText = Object.values(row)
                .filter((val) => typeof val === "string")
                .join(" ")
                .toLowerCase();

            const attachmentText = Array.isArray(row.attachmentLinks)
                ? row.attachmentLinks.flatMap((file) =>
                    Object.values(file).map((val) =>
                        typeof val === "string"
                            ? val
                            : val instanceof Date
                                ? val.toLocaleString("fa-IR", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })
                                : typeof val === "number"
                                    ? val.toString()
                                    : ""
                    )
                )
                : [];

            const allText = `${baseText} ${attachmentText.join(" ")}`.toLowerCase();
            return allText.includes(normalizedSearch);
        });
    }, [searchText, internalRows]);

    const toggleExpand = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleSearchInput = useCallback((e) => {
        setSearchText(e.target.value);
    }, []);

    const handleDeleteFile = async (docId, fileId) => {
        try {
            await deleteAttachment(docId, fileId);
            message.success(" فایل حذف شد");

            const res = await getAttachments(docId);
            const updatedAttachments = res.data || [];

            const updatedRows = internalRows.map((row) =>
                row.id === docId
                    ? {...row, attachmentLinks: updatedAttachments}
                    : row
            );

            setInternalRows(updatedRows);
        } catch (err) {
            console.error("❌ خطا در حذف فایل:", err);
            message.error("خطا در حذف فایل");
        }
    };

    const handleUploadSuccess = async () => {
        setShowUploadModal(false);

        try {
            const res = await getAttachments(selectedRowId);
            const updatedAttachments = res.data || [];

            const updated = internalRows.map((row) =>
                row.id === selectedRowId
                    ? {...row, attachmentLinks: updatedAttachments}
                    : row
            );

            setInternalRows(updated);
        } catch {
            console.warn("❌ خطا در دریافت ضمیمه‌های جدید");
        }

        if (typeof onRefreshRowData === "function") {
            onRefreshRowData();
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <div
                className="flex justify-between items-center gap-3 flex-col sm:flex-row"
                style={{marginBottom: "0.5rem"}}
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

            {/* 👇 عنوان ستون‌ها */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingInline: 12,
                    background: "#f5f5f5",
                    fontWeight: "bold",
                    borderBottom: "1px solid #ddd",
                }}
            >
                <div style={{width: 36}}/>
                {columnDefs.map((col, index) => (
                    <div key={index} style={{minWidth: col.minWidth || 120}}>
                        {col.headerName ?? col.field}
                    </div>
                ))}
            </div>

            {/* 👇 ردیف‌های جدول */}
            <div className="ag-theme-alpine" style={{width: "100%"}}>
                {filteredRows.map((row) => {
                    const isFinalized = row.status === "FINALIZED";
                    const normalizedSearch = searchText.toLowerCase();
                    const matchesSearch = searchText?.trim().length > 0;

                    const matchingFiles = matchesSearch
                        ? (row.attachmentLinks ?? []).filter((file) =>
                            Object.values(file)
                                .filter((val) => typeof val === "string")
                                .some((text) =>
                                    text.toLowerCase().includes(normalizedSearch)
                                )
                        )
                        : row.attachmentLinks ?? [];

                    return (
                        <div key={row.id} style={{borderBottom: "1px solid #eee", padding: "8px 0"}}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    paddingInline: 12,
                                }}
                            >
                                <Button
                                    type="text"
                                    icon={
                                        expandedRows[row.id] ? <MinusSquareOutlined/> : <PlusSquareOutlined/>
                                    }
                                    onClick={() => toggleExpand(row.id)}
                                />

                                {columnDefs.map((col, index) => (
                                    <div key={index} style={{minWidth: col.minWidth || 120}}>
                                        {typeof col.cellRenderer === "function"
                                            ? col.cellRenderer({data: row})
                                            : row[col.field]?.toString().trim() || "—"}
                                    </div>
                                ))}
                            </div>

                            {/* 👇 ضمایم در حالت باز */}
                            {expandedRows[row.id] && (
                                <div style={{padding: "12px 40px", background: "#f7f7f7"}}>
                                    <div style={{marginBottom: 8}}>
                                        <Button
                                            type="dashed"
                                            icon={<UploadOutlined/>}
                                            onClick={() => {
                                                setSelectedRowId(row.id);
                                                setShowUploadModal(true);
                                            }}
                                            disabled={isFinalized} // ❌ غیر فعال اگر قطعی
                                        >
                                            بارگذاری فایل جدید
                                        </Button>
                                    </div>

                                    <div style={{border: "1px solid #ddd", borderRadius: 8, padding: "12px"}}>
                                        <table style={{width: "100%", fontSize: "0.9rem"}}>
                                            <thead>
                                            <tr style={{background: "#f0f0f0", textAlign: "center"}}>
                                                <th>نام فایل</th>
                                                <th>فرمت</th>
                                                <th>شرح فایل</th>
                                                <th>شرکت / شخص</th>
                                                <th>تاریخ بارگذاری</th>
                                                <th>آپلودکننده</th>
                                                <th>پیش‌نمایش</th>
                                                <th>حذف</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {matchingFiles.map((file) => (
                                                <tr key={file.id} style={{textAlign: "center"}}>
                                                    <td>{file.fileName || "—"}</td>
                                                    <td>{file.extension || "—"}</td>
                                                    <td>{file.description?.trim() || "—"}</td>
                                                    <td>{file.companyName || file.company?.name || "—"}</td>
                                                    <td>
                                                        {file.uploadedAt
                                                            ? new Date(file.uploadedAt).toLocaleString("fa-IR", {
                                                                dateStyle: "medium",
                                                                timeStyle: "short",
                                                            })
                                                            : "—"}
                                                    </td>
                                                    <td>{file.companyName || file.company?.name || "—"}</td>
                                                    <td>{file.uploadedBy || "—"}</td>
                                                    <td>
                                                        <Tooltip title="مشاهده فایل">
                                                            <Button
                                                                type="link"
                                                                icon={<EyeOutlined/>}
                                                                href={`http://localhost:8080/api/attachments/public/${row.id}/file/${file.id}`}
                                                                target="_blank"
                                                            />
                                                        </Tooltip>
                                                    </td>
                                                    <td>
                                                        <Tooltip title="حذف فایل">
                                                            <Button
                                                                danger
                                                                type="text"
                                                                icon={<CloseOutlined/>}
                                                                onClick={() => handleDeleteFile(row.id, file.id)}
                                                            />
                                                        </Tooltip>
                                                    </td>
                                                </tr>
                                            ))}
                                            {matchingFiles.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} style={{textAlign: "center", color: "#999"}}> هیچ
                                                        فایل
                                                        مرتبطی با عبارت جست‌وجو یافت نشد
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>)} </div>);
                })} </div>

            {showUploadModal && selectedRowId && (<UploadModal documentId={selectedRowId} visible={showUploadModal}
                                                               onClose={() => setShowUploadModal(false)}
                                                               onSuccess={handleUploadSuccess}/>)} </div>);
};

export default Tabel;