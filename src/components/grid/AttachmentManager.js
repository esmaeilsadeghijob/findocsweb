import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    Button,
    Input,
    Select,
    Space,
    Popconfirm,
    Tag,
    Tooltip,
    message
} from "antd";
import {
    EyeOutlined,
    UploadOutlined,
    EditOutlined,
    CloseOutlined,
    ReloadOutlined,
    PlusOutlined, FileAddOutlined, CloudUploadOutlined, SearchOutlined,
} from "@ant-design/icons";
import {
    getDocumentsByFilter,
    getAttachments,
    deleteAttachment,
    updateAttachment,
    advanceDocumentStatus,
    revertDocumentStatus,
    getCategories,
    getCompanies,
    deleteDocument
} from "../../api/api";
import UploadModal from "./UploadModal";
import PdfPreview from "./PdfPreview";
import DocumentFormModal from "./DocumentFormModal";
import EditDocumentModal from "./EditDocumentModal";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

const AttachmentManager = ({
                               clientId,
                               unitId,
                               unitName,
                               serviceId,
                               serviceName,
                               periodId,
                               fiscalYear,
                               accessLevel,
                               roles,
                               currentUser
                           }) => {
    const [documents, setDocuments] = useState([]);
    const [editingFileId, setEditingFileId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [categories, setCategories] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfBase64, setPdfBase64] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editDocument, setEditDocument] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [expandedKeys, setExpandedKeys] = useState([]);

    const isAdmin = Array.isArray(roles) && roles.includes("ROLE_ADMIN");
    const canCreate = isAdmin || ["CREATE", "OWNER", "ADMIN"].includes(accessLevel);
    const canReadGlobal = isAdmin || ["READ", "EDIT", "DOWNLOAD", "OWNER", "REVERT", "ADMIN", "CREATE"].includes(accessLevel);

    useEffect(() => {
        getCategories().then((res) => setCategories(res.data || []));
        getCompanies().then((res) => setCompanies(res.data || []));
    }, []);

    const fetchDocuments = async () => {
        if (!clientId) return;
        try {
            const resDocs = await getDocumentsByFilter(clientId, unitId, serviceId);
            const enriched = await Promise.all(
                resDocs.data.map(async (doc) => {
                    const attachments = await getAttachments(doc.id).then((res) => res.data).catch(() => []);
                    return {
                        ...doc,
                        attachmentLinks: attachments,
                        title: doc.title?.trim() || "—",
                        documentNumber: doc.documentNumber || "—",
                        fiscalYear: doc.periodFiscalYear || "—",
                        serviceName: doc.serviceName || "—",
                        description: doc.description || "—",
                        status: doc.status || "DRAFT"
                    };
                })
            );
            setDocuments(enriched);
        } catch {
            message.error("خطا در دریافت اسناد");
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [clientId]);

    const handleDeleteFile = async (docId, fileId) => {
        try {
            await deleteAttachment(docId, fileId);
            const res = await getAttachments(docId);
            setDocuments((prev) =>
                prev.map((d) =>
                    d.id === docId ? { ...d, attachmentLinks: res.data || [] } : d
                )
            );
            message.success("فایل حذف شد");
        } catch {
            message.error("خطا در حذف فایل");
        }
    };

    const handleSaveFile = async (docId, fileId) => {
        try {
            await updateAttachment(docId, fileId, editValues);
            const res = await getAttachments(docId);
            setDocuments((prev) =>
                prev.map((d) =>
                    d.id === docId ? { ...d, attachmentLinks: res.data || [] } : d
                )
            );
            setEditingFileId(null);
            setEditValues({});
            message.success("ویرایش انجام شد");
        } catch {
            message.error("خطا در ذخیرهٔ تغییرات");
        }
    };

    const handleAdvanceStatus = async (id) => {
        try {
            await advanceDocumentStatus(id);
            fetchDocuments();
        } catch {
            message.error("خطا در تغییر وضعیت سند");
        }
    };

    const handleRevertStatus = async (id) => {
        try {
            await revertDocumentStatus(id);
            fetchDocuments();
            message.success("وضعیت سند بازگردانی شد");
        } catch {
            message.error("خطا در بازگردانی وضعیت سند");
        }
    };

    const handleDeleteDocument = async (id) => {
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        } catch {
            message.error("خطا در حذف سند");
        }
    };

    const attachmentColumns = (docId) => [
        {
            title: "دسته‌بندی",
            dataIndex: "categoryName",
            render: (_, file) =>
                editingFileId === file.id ? (
                    <Select
                        showSearch
                        value={editValues.categoryName}
                        onChange={(val) =>
                            setEditValues((prev) => ({ ...prev, categoryName: val }))
                        }
                        options={categories.map((c) => ({
                            label: c.name,
                            value: c.name
                        }))}
                        style={{ width: "100%" }}
                        placeholder="انتخاب دسته‌بندی"
                    />
                ) : (
                    file.categoryName || "—"
                )
        },
        {
            title: "نام فایل",
            dataIndex: "fileName"
        },
        {
            title: "فرمت",
            dataIndex: "extension"
        },
        {
            title: "شرح فایل",
            dataIndex: "description",
            render: (_, file) =>
                editingFileId === file.id ? (
                    <Input
                        value={editValues.description}
                        onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, description: e.target.value }))
                        }
                    />
                ) : (
                    file.description || "—"
                )
        },
        {
            title: "شرکت / شخص",
            dataIndex: "companyName",
            render: (_, file) =>
                editingFileId === file.id ? (
                    <Select
                        showSearch
                        value={editValues.companyName}
                        onChange={(val) =>
                            setEditValues((prev) => ({ ...prev, companyName: val }))
                        }
                        options={companies.map((c) => ({
                            label: c.name,
                            value: c.name
                        }))}
                        style={{ width: "100%" }}
                        placeholder="انتخاب شرکت / شخص"
                    />
                ) : (
                    file.companyName || "—"
                )
        },
        {
            title: "تاریخ بارگذاری",
            dataIndex: "uploadedAt",
            render: (val) => new Date(val).toLocaleDateString("fa-IR")
        },
        {
            title: "آپلودکننده",
            dataIndex: "uploadedBy"
        },
        {
            title: "پیش‌نمایش",
            render: (_, file) =>
                file.mimeType === "application/pdf" ? (
                    <Button
                        type="text"
                        icon={<EyeOutlined style={{ color: "#1890ff" }} />}
                        onClick={() => {
                            setPdfBase64(file.fileData);
                            setShowPdfModal(true);
                        }}
                    />
                ) : (
                    <a
                        href={`data:${file.mimeType};base64,${file.fileData}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <EyeOutlined style={{ color: "#1890ff" }} />
                    </a>
                )
        },
        {
            title: "عملیات",
            render: (_, file) =>
                editingFileId === file.id ? (
                    <Space>
                        <Button type="primary" size="small" onClick={() => handleSaveFile(docId, file.id)}>
                            ذخیره
                        </Button>
                        <Button size="small" onClick={() => {
                            setEditingFileId(null);
                            setEditValues({});
                        }}>
                            لغو
                        </Button>
                    </Space>
                ) : (
                    <Space>
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setEditingFileId(file.id                );
                                setEditValues({
                                    categoryName: file.categoryName?.trim(),
                                    description: file.description,
                                    companyName: file.companyName?.trim()
                                });
                            }}
                        />
                        <Popconfirm
                            title="آیا از حذف فایل مطمئن هستید؟"
                            onConfirm={() => handleDeleteFile(docId, file.id)}
                            okText="بله"
                            cancelText="خیر"
                        >
                            <Button type="text" danger icon={<CloseOutlined />} />
                        </Popconfirm>
                    </Space>
                )
        }
    ];

    const filteredDocuments = useMemo(() => {
        if (!searchText) {
            setExpandedKeys([]);
            return documents;
        }

        const normalized = searchText.toLowerCase();
        const matched = [];

        documents.forEach((doc) => {
            const docText = Object.values(doc)
                .filter((val) => typeof val === "string")
                .join(" ")
                .toLowerCase();

            const attachmentText = (doc.attachmentLinks ?? [])
                .flatMap((file) =>
                    Object.values(file)
                        .filter((val) => typeof val === "string")
                        .map((val) => val.toLowerCase())
                )
                .join(" ");

            const allText = `${docText} ${attachmentText}`;
            if (allText.includes(normalized)) {
                matched.push(doc.id);
            }
        });

        setExpandedKeys(matched);
        return documents.filter((doc) => matched.includes(doc.id));
    }, [searchText, documents]);

    const mainColumns = [
        {
            title: "شماره سند",
            dataIndex: "documentNumber"
        },
        {
            title: "سال مالی",
            dataIndex: "fiscalYear"
        },
        {
            title: "شرح سند",
            dataIndex: "description"
        },
        {
            title: "تاریخ سند",
            dataIndex: "documentTimestamp",
            render: (val) => {
                const date = moment(val);
                return date.isValid() ? date.format("jYYYY/jMM/jDD") : "—";
            }
        },
        {
            title: "وضعیت",
            dataIndex: "status",
            render: (_, doc) => {
                const label =
                    doc.status === "FINALIZED"
                        ? "قطعی"
                        : doc.status === "SUBMITTED"
                            ? "ثبت‌شده"
                            : "پیش‌نویس";

                const color =
                    doc.status === "FINALIZED"
                        ? "green"
                        : doc.status === "SUBMITTED"
                            ? "orange"
                            : "default";

                const allowAdvance =
                    doc.status !== "FINALIZED" &&
                    (isAdmin || ["OWNER", "ADMIN"].includes(accessLevel));

                const allowRevert =
                    doc.status === "FINALIZED" &&
                    (isAdmin || ["OWNER", "ADMIN", "REVERT"].includes(accessLevel));

                return (
                    <Space>
                        <Tooltip title={allowAdvance ? "تغییر وضعیت سند" : ""}>
                            <Tag
                                color={color}
                                onClick={() => {
                                    if (allowAdvance) handleAdvanceStatus(doc.id);
                                }}
                                style={{ cursor: allowAdvance ? "pointer" : "default" }}
                            >
                                {label}
                            </Tag>
                        </Tooltip>
                        {allowRevert && (
                            <Tooltip title="بازگردانی وضعیت سند">
                                <Button
                                    type="text"
                                    icon={<ReloadOutlined style={{ fontSize: 18, color: "#fa8c16" }} />}
                                    onClick={() => handleRevertStatus(doc.id)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                );
            }
        },
        {
            title: "عملیات",
            render: (_, doc) => {
                const isFinalized = doc.status === "FINALIZED";
                const allowEdit = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
                const allowDelete = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
                return (
                    <Space>
                        <Button
                            icon={<EditOutlined style={{ color: isFinalized ? "#ccc" : "#1890ff" }} />}
                            disabled={!allowEdit || isFinalized}
                            onClick={() => {
                                setEditDocument(doc);
                                setShowEditModal(true);
                            }}
                        />
                        <Popconfirm
                            title="آیا از حذف سند مطمئن هستید؟"
                            onConfirm={() => handleDeleteDocument(doc.id)}
                            okText="بله"
                            cancelText="خیر"
                            disabled={!allowDelete || isFinalized}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<CloseOutlined style={{ color: isFinalized ? "#ccc" : "red" }} />}
                                disabled={!allowDelete || isFinalized}
                            />
                        </Popconfirm>
                    </Space>
                );
            }
        }
    ];

    if (!canReadGlobal) {
        return <div style={{ color: "red" }}>شما مجاز به مشاهده اسناد نیستید!</div>;
    }

    return (
        <>
            <div style={{display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem"}}>
                {canCreate && (
                    <Button
                        type="text"
                        icon={<FileAddOutlined />}
                        style={{
                            fontSize: "1rem",
                            padding: "0 6px",
                            color: "#1890ff"
                        }}
                        onClick={() => {
                            if (serviceId && unitId) {
                                setShowModal(true);
                            } else {
                                message.warning("اطلاعات سرویس یا واحد کامل نیست");
                            }
                        }}
                    >
                        ثبت سند جدید
                    </Button>
                )}

                <Input
                    allowClear
                    placeholder="جست‌وجو در اسناد و فایل‌ها"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                        maxWidth: 400,
                        direction: "rtl",
                        textAlign: "right"
                    }}
                    prefix={
                        !searchText && <SearchOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                    }
                />
            </div>

            <Table
                rowKey="id"
                columns={mainColumns}
                dataSource={filteredDocuments}
                expandable={{
                    expandedRowRender: (doc) => {
                        const normalized = searchText.toLowerCase();
                        const filteredAttachments = doc.attachmentLinks?.filter((file) =>
                            Object.values(file)
                                .filter((val) => typeof val === "string")
                                .some((val) => val.toLowerCase().includes(normalized))
                        ) ?? [];

                        return (
                            <>
                                <div style={{ marginBottom: 8 }}>
                                    <Button
                                        type="dashed"
                                        icon={<CloudUploadOutlined />}
                                        onClick={() => {
                                            setSelectedDocumentId(doc.id);
                                            setShowUploadModal(true);
                                        }}
                                        disabled={doc.status === "FINALIZED"}
                                    >
                                        بارگذاری فایل جدید
                                    </Button>
                                </div>
                                <Table
                                    rowKey="id"
                                    columns={attachmentColumns(doc.id)}
                                    dataSource={filteredAttachments}
                                    pagination={false}
                                    size="small"
                                />
                            </>
                        );
                    },
                    expandedRowKeys: expandedKeys,
                    onExpandedRowsChange: setExpandedKeys
                }}
                pagination={false}
                size="middle"
                // bordered
            />

            <PdfPreview
                visible={showPdfModal}
                base64Data={pdfBase64}
                onClose={() => setShowPdfModal(false)}
            />

            <UploadModal
                visible={showUploadModal}
                documentId={selectedDocumentId}
                onSuccess={async () => {
                    await fetchDocuments();
                    setShowUploadModal(false);
                }}
                onCancel={() => setShowUploadModal(false)}
            />

            {showModal && (
                <DocumentFormModal
                    visible
                    clientId={clientId}
                    unitId={unitId}
                    unitName={unitName}
                    serviceId={serviceId}
                    serviceName={serviceName}
                    periodId={periodId}
                    defaultPeriodLabel={fiscalYear}
                    onCancel={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchDocuments();
                    }}
                />
            )}

            {showEditModal && editDocument && (
                <EditDocumentModal
                    visible={showEditModal}
                    editData={editDocument}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditDocument(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setEditDocument(null);
                        fetchDocuments();
                    }}
                />
            )}
        </>
    );
};

export default AttachmentManager;
