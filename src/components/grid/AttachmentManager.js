import React, {useEffect, useState, useMemo} from "react";
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
    FileAddOutlined,
    CloudUploadOutlined,
    SearchOutlined,
    SaveOutlined
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
import {
    canRead,
    canCreate,
    canEdit,
    canManageAttachments,
    canRevert
} from "./accessUtils";

moment.loadPersian({usePersianDigits: true, dialect: "persian-modern"});

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

    const allowRead = canRead(currentUser?.role, accessLevel);
    const allowCreate = canCreate(currentUser?.role, accessLevel);
    const allowEdit = canEdit(currentUser?.role, accessLevel);
    const allowUpload = canManageAttachments(currentUser?.role, accessLevel);
    const allowRevert = canRevert(currentUser?.role, accessLevel);

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
                        archiveCode: doc.archiveCode || "—",
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
                    d.id === docId ? {...d, attachmentLinks: res.data || []} : d
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
                    d.id === docId ? {...d, attachmentLinks: res.data || []} : d
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

    const attachmentColumns = (docId) => {
        const allowEdit = canManageAttachments(currentUser?.role, accessLevel);
        const allowRead = canRead(currentUser?.role, accessLevel);

        const columns = [
            {
                title: "دسته‌بندی",
                dataIndex: "categoryName",
                render: (_, file) =>
                    editingFileId === file.id && allowEdit ? (
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
                    editingFileId === file.id && allowEdit ? (
                        <Input
                            value={editValues.description}
                            onChange={(e) =>
                                setEditValues((prev) => ({
                                    ...prev,
                                    description: e.target.value
                                }))
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
                    editingFileId === file.id && allowEdit ? (
                        <Select
                            showSearch
                            value={editValues.companyName}
                            onChange={(val) =>
                                setEditValues((prev) => ({
                                    ...prev,
                                    companyName: val
                                }))
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
                    allowRead ? (
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
                    ) : null
            }
        ];

        // فقط اگر اجازهٔ ویرایش داریم، ستون عملیات رو اضافه کن
        if (allowEdit) {
            columns.push({
                title: "عملیات",
                render: (_, file) =>
                    editingFileId === file.id ? (
                        <Space>
                            <Tooltip title="ذخیره تغییرات">
                                <Button
                                    icon={<SaveOutlined />}
                                    type="primary"
                                    size="small"
                                    onClick={() => handleSaveFile(docId, file.id)}
                                />
                            </Tooltip>

                            <Tooltip title="لغو ویرایش">
                                <Button
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => {
                                        setEditingFileId(null);
                                        setEditValues({});
                                    }}
                                />
                            </Tooltip>
                        </Space>
                    ) : (
                        <Space>
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => {
                                    setEditingFileId(file.id);
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
            });
        }

        return columns;
    };

    const baseColumns = [
        {
            title: "شماره سند",
            dataIndex: "documentNumber",
            sorter: (a, b) => (a.documentNumber || 0) - (b.documentNumber || 0),
        },
        {
            title: "شماره بایگانی",
            dataIndex: "archiveNumber",
            sorter: (a, b) => (a.archiveNumber || 0) - (b.archiveNumber || 0),
            defaultSortOrder: "descend"
        },
        {
            title: "تاریخ بایگانی",
            dataIndex: "archiveDate",
            sorter: (a, b) => (a.archiveDate || 0) - (b.archiveDate || 0),
            render: (val) => {
                const date = moment(val);
                return date.isValid() ? date.format("jYYYY/jMM/jDD") : "—";
            }
        },
        {
            title: "سال مالی",
            dataIndex: "fiscalYear",
            sorter: (a, b) => (a.fiscalYear || 0) - (b.fiscalYear || 0),
        },
        {
            title: "شرح سند",
            dataIndex: "description",
            sorter: (a, b) => (a.description || 0) - (b.description || 0),
        },
        {
            title: "تاریخ سند",
            dataIndex: "documentTimestamp",
            sorter: (a, b) => (a.documentTimestamp || 0) - (b.documentTimestamp || 0),
            render: (val) => {
                const date = moment(val);
                return date.isValid() ? date.format("jYYYY/jMM/jDD") : "—";
            }
        },
        {
            title: "کد بایگانی",
            dataIndex: "archiveCode",
            render: (val) => {
                const normalized = typeof val === "string" ? val.trim() : "";
                if (!normalized || normalized === "—") {
                    return <span style={{ color: "#fa8c16" }}>کد ثبت نشده</span>;
                }
                return normalized;
            },
            sorter: (a, b) => (a.archiveCode || "").localeCompare(b.archiveCode || "")
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

                const allowAdvance = doc.status !== "FINALIZED" && allowEdit;
                const allowRevertStatus = doc.status === "FINALIZED" && allowRevert;

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
                        {allowRevertStatus && (
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
        }
    ];

// فقط اگر کاربر اجازهٔ ویرایش داشته باشه، ستون عملیات رو اضافه کن
    if (allowEdit) {
        baseColumns.push({
            title: "عملیات",
            render: (_, doc) => {
                const isFinalized = doc.status === "FINALIZED";

                return (
                    <Space>
                        <Button
                            icon={<EditOutlined style={{ color: isFinalized ? "#ccc" : "#1890ff" }} />}
                            disabled={isFinalized}
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
                            disabled={isFinalized}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<CloseOutlined style={{ color: isFinalized ? "#ccc" : "red" }} />}
                                disabled={isFinalized}
                            />
                        </Popconfirm>
                    </Space>
                );
            }
        });
    }

    const mainColumns = baseColumns;

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

    if (!allowRead) {
        return <div style={{color: "red"}}>شما مجاز به مشاهده اسناد نیستید!</div>;
    }

    return (
        <>
            <div style={{display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem"}}>
                {allowCreate && (
                    <Button
                        type="text"
                        icon={<FileAddOutlined/>}
                        style={{fontSize: "1rem", padding: "0 6px", color: "#1890ff"}}
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
                    placeholder="جستجو"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                        maxWidth: 400,
                        direction: "rtl",
                        textAlign: "right"
                    }}
                    prefix={
                        !searchText && <SearchOutlined style={{color: "#1890ff", fontSize: 16}}/>
                    }
                />
            </div>

            <Table
                rowKey="id"
                columns={mainColumns}
                locale={{
                    triggerDesc: "کلیک برای مرتب‌سازی نزولی",
                    triggerAsc: "کلیک برای مرتب‌سازی صعودی",
                    cancelSort: "کلیک برای لغو مرتب‌سازی",
                }}
                dataSource={filteredDocuments}
                expandable={{
                    expandedRowRender: (doc) => {
                        const normalized = searchText.toLowerCase().trim();
                        const filteredAttachments = !searchText
                            ? doc.attachmentLinks
                            : (doc.attachmentLinks ?? []).filter((file) =>
                                Object.values(file)
                                    .filter((val) => typeof val === "string")
                                    .some((val) => val.toLowerCase().includes(normalized))
                            );

                        return (
                            <>
                                {allowUpload && (
                                    <div style={{marginBottom: 8}}>
                                        <Button
                                            type="dashed"
                                            icon={<CloudUploadOutlined/>}
                                            onClick={() => {
                                                setSelectedDocumentId(doc.id);
                                                setShowUploadModal(true);
                                            }}
                                            disabled={doc.status === "FINALIZED"}
                                        >
                                            بارگذاری فایل جدید
                                        </Button>
                                    </div>
                                )}
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
                onClose={() => setShowUploadModal(false)}
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
