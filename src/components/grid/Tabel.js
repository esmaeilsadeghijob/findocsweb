import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Button,
    message,
    Popconfirm
} from "antd";
import {
    CloseOutlined,
    EyeOutlined,
    MinusSquareOutlined,
    PlusSquareOutlined,
    UploadOutlined
} from "@ant-design/icons";
import {
    getAttachments,
    deleteAttachment
} from "../../api/api";
import UploadModal from "./UploadModal";
import { DeleteOutlined } from "@ant-design/icons";
import PdfPreview from "./PdfPreview";

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
                   canManageAttachments
               }) => {
    const [searchText, setSearchText] = useState("");
    const [expandedRows, setExpandedRows] = useState({});
    const [selectedRowId, setSelectedRowId] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [internalRows, setInternalRows] = useState([]);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfBase64, setPdfBase64] = useState("");

    // ✅ برای حفظ ترتیب ردیف‌ها
    const updateRowById = (updatedRow) => {
        setInternalRows((prev) =>
            prev.map((row) => (row.id === updatedRow.id ? updatedRow : row))
        );
    };

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
                                    timeStyle: "short"
                                })
                                : typeof val === "number"
                                    ? val.toString()
                                    : ""
                    )
                )
                : [];

            const allText = `${baseText} ${attachmentText.join(" ")}`;
            return allText.includes(normalizedSearch);
        });
    }, [searchText, internalRows]);

    const toggleExpand = (id) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleSearchInput = useCallback((e) => {
        setSearchText(e.target.value);
    }, []);

    const handleDeleteFile = async (docId, fileId) => {
        try {
            await deleteAttachment(docId, fileId);
            message.success("فایل حذف شد");

            const res = await getAttachments(docId);
            const updatedAttachments = res.data || [];

            const updatedRow = internalRows.find((r) => r.id === docId);
            if (updatedRow) {
                updateRowById({ ...updatedRow, attachmentLinks: updatedAttachments });
            }
        } catch {
            message.error("خطا در حذف فایل");
        }
    };

    const handleUploadSuccess = async () => {
        setShowUploadModal(false);

        try {
            const res = await getAttachments(selectedRowId);
            const updatedAttachments = res.data || [];

            const updatedRow = internalRows.find((r) => r.id === selectedRowId);
            if (updatedRow) {
                updateRowById({ ...updatedRow, attachmentLinks: updatedAttachments });
            }
        } catch {
            console.warn("خطا در دریافت ضمیمه‌های جدید");
        }

        if (typeof onRefreshRowData === "function") {
            onRefreshRowData();
        }
    };

    const getPreviewUrl = (file) => {
        if (file.fileData && file.mimeType) {
            return `data:${file.mimeType};base64,${file.fileData}`;
        }
        return "#";
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* نوار بالا */}
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
                            marginRight: "1rem"
                        }}
                    />
                )}
            </div>

            {/* ستون‌ها */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingInline: 12,
                    background: "#f5f5f5",
                    fontWeight: "bold",
                    borderBottom: "1px solid #ddd"
                }}
            >
                <div style={{ width: 36 }} />
                {columnDefs.map((col) => (
                    <div key={col.field || col.headerName} style={{ minWidth: col.minWidth || 120 }}>
                        {col.headerName ?? col.field}
                    </div>
                ))}
            </div>

            {/* ردیف‌ها */}
            <div style={{ width: "100%" }}>
                {filteredRows.map((row) => {
                    const isFinalized = row.status === "FINALIZED";
                    const normalizedSearch = searchText.toLowerCase();

                    const matchingFiles = (row.attachmentLinks ?? []).filter((file) =>
                        Object.values(file)
                            .filter((val) => typeof val === "string")
                            .some((text) => text.toLowerCase().includes(normalizedSearch))
                    );

                    return (
                        <div key={row.id} style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    paddingInline: 12
                                }}
                            >
                                <Button
                                    type="text"
                                    icon={
                                        expandedRows[row.id]
                                            ? <MinusSquareOutlined />
                                            : <PlusSquareOutlined />
                                    }
                                    onClick={() => toggleExpand(row.id)}
                                />

                                {columnDefs.map((col) => (
                                    <div key={col.field || col.headerName} style={{ minWidth: col.minWidth || 120 }}>
                                        {typeof col.cellRenderer === "function"
                                            ? col.cellRenderer({ data: row })
                                            : row[col.field]?.toString().trim() || "—"}
                                    </div>
                                ))}
                            </div>

                            {expandedRows[row.id] && (
                                <div style={{ padding: "12px 40px", background: "#f7f7f7" }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Button
                                            type="dashed"
                                            icon={<UploadOutlined />}
                                            onClick={() => {
                                                setSelectedRowId(row.id);
                                                setShowUploadModal(true);
                                            }}
                                            disabled={isFinalized}
                                        >
                                            بارگذاری فایل جدید
                                        </Button>
                                    </div>

                                    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: "12px" }}>
                                        <table style={{ width: "100%", fontSize: "0.9rem" }}>
                                            <thead>
                                            <tr style={{ background: "#f0f0f0", textAlign: "center" }}>
                                                <th>دسته بندی</th>
                                                <th>نام فایل</th>
                                                <th>فرمت</th>
                                                <th>شرح فایل</th>
                                                <th>شرکت / شخص</th>
                                                <th>تاریخ بارگذاری</th>
                                                <th>آپلودکننده</th>
                                                <th>پیش‌نمایش</th>
                                                {canManageAttachments && <th>حذف</th>}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {matchingFiles.map((file) => (
                                                <tr key={file.id} style={{textAlign: "center"}}>
                                                    <td>{file.categoryName}</td>
                                                    <td>{file.fileName}</td>
                                                    <td>{file.extension}</td>
                                                    <td>{file.description || "—"}</td>
                                                    <td>{file.companyName || "—"}</td>
                                                    <td>{new Date(file.uploadedAt).toLocaleDateString("fa-IR")}</td>
                                                    <td>{file.uploadedBy || "—"}</td>
                                                    <td>
                                                        {file.mimeType === "application/pdf" ? (
                                                            <Button
                                                                type="text"
                                                                onClick={() => {
                                                                    setPdfBase64(file.fileData);
                                                                    setShowPdfModal(true);
                                                                }}
                                                                icon={<EyeOutlined
                                                                    style={{fontSize: 16, color: "#1890ff"}}/>}
                                                                title="نمایش فایل PDF"
                                                            />
                                                        ) : (
                                                            <a
                                                                href={getPreviewUrl(file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="مشاهده فایل"
                                                            >
                                                                <EyeOutlined style={{fontSize: 16, color: "#1890ff"}}/>
                                                            </a>
                                                        )}
                                                    </td>

                                                    {canManageAttachments && (
                                                        <td>
                                                            <Popconfirm
                                                                title="آیا از حذف فایل مطمئن هستید؟"
                                                                onConfirm={() => handleDeleteFile(row.id, file.id)}
                                                                okText="بله"
                                                                cancelText="خیر"
                                                            >
                                                                <Button type="text" danger icon={<CloseOutlined/>}/>
                                                            </Popconfirm>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                        <PdfPreview
                                            visible={showPdfModal}
                                            base64Data={pdfBase64}
                                            onClose={() => setShowPdfModal(false)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* مودال آپلود فایل */}
            {showUploadModal && (
                <UploadModal
                    visible={showUploadModal}
                    documentId={selectedRowId}
                    onSuccess={handleUploadSuccess}
                    onCancel={() => setShowUploadModal(false)}
                />
            )}
        </div>
    );
};

export default Tabel;
