import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Button, Tooltip } from "antd";
import {
    PlusSquareOutlined,
    MinusSquareOutlined,
    UploadOutlined,
    EyeOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import UploadModal from "./UploadModal";
import { getAttachments } from "../../api/api";

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

    // ⬅ بروزرسانی داده‌های داخلی وقتی rowData تغییر کنه
    useEffect(() => {
        setInternalRows(rowData);
    }, [rowData]);

    // ⬅ گسترش ردیف‌ها هنگام جستجو
    useEffect(() => {
        if (!searchText) {
            setExpandedRows({});
            return;
        }

        const autoExpanded = {};
        rowData.forEach((row) => {
            const matches = row.attachmentLinks?.some(
                (file) =>
                    typeof file.fileName === "string" &&
                    file.fileName.toLowerCase().includes(searchText.toLowerCase())
            );
            if (matches) {
                autoExpanded[row.id] = true;
            }
        });

        setExpandedRows(autoExpanded);
    }, [searchText, rowData]);

    const defaultColDef = useMemo(
        () => ({
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
        }),
        [sortCol, filter]
    );

    const filteredRows = useMemo(() => {
        if (!searchText) return internalRows;

        return internalRows.filter((row) => {
            const textContent = [
                ...Object.values(row),
                ...(Array.isArray(row.attachmentLinks)
                    ? row.attachmentLinks.map((f) => f.fileName)
                    : []),
            ]
                .filter((val) => typeof val === "string")
                .join(" ")
                .toLowerCase();

            return textContent.includes(searchText.toLowerCase());
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

    const handleDeleteFile = (docId, fileId) => {
        console.log("❌ حذف فایل", fileId, "از سند", docId);
        // ⬅ اضافه کردن منطق حذف و سپس fetch ضمیمه‌ها
    };

    const handleUploadSuccess = async () => {
        console.log("✅ فایل جدید بارگذاری شد");
        setShowUploadModal(false);

        try {
            const res = await getAttachments(selectedRowId);
            const updatedAttachments = res.data || [];

            const updated = internalRows.map((row) =>
                row.id === selectedRowId
                    ? { ...row, attachmentLinks: updatedAttachments }
                    : row
            );

            setInternalRows(updated);
        } catch {
            console.warn("❌ خطا در دریافت ضمیمه‌های جدید");
        }

        // اگر خواستی کل سندها رفرش بشن:
        if (typeof onRefreshRowData === "function") {
            onRefreshRowData();
        }
    };

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
                                        onClick={() => {
                                            setSelectedRowId(row.id);
                                            setShowUploadModal(true);
                                        }}
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
                                            <th>شرح فایل</th>
                                            <th>تاریخ بارگذاری</th>
                                            <th>آپلودکننده</th>
                                            <th>پیش‌نمایش</th>
                                            <th>حذف</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {(row.attachmentLinks ?? []).map((file) => (
                                            <tr key={file.id} style={{ textAlign: "center" }}>
                                                <td>{file.fileName}</td>
                                                <td>{file.extension}</td>
                                                <td>{file.description || "—"}</td>
                                                <td>
                                                    {file.uploadedAt
                                                        ? new Date(file.uploadedAt).toLocaleString("fa-IR", {
                                                            dateStyle: "medium",
                                                            timeStyle: "short",
                                                        })
                                                        : "—"}
                                                </td>
                                                <td>{file.uploadedBy || "—"}</td>
                                                <td>
                                                    <Tooltip title="مشاهده فایل">
                                                        <Button
                                                            type="link"
                                                            icon={<EyeOutlined />}
                                                            // href={`/api/attachments/${row.id}/preview/${file.id}`}
                                                            // href={`http://localhost:8080/api/attachments/public/${documentId}/file/${file.id}`}
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
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleDeleteFile(row.id, file.id)}
                                                            target="_blank"
                                                        />
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        ))}
                                        {row.attachmentLinks?.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: "center", color: "#999" }}>
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

            {showUploadModal && selectedRowId && (
                <UploadModal
                    documentId={selectedRowId}
                    visible={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
};

export default Tabel;
