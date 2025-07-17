import { useEffect, useMemo, useState } from "react";
import Tabel from "./Tabel";
import TabelActionBtn from "./TabelActionBtn";
import DocumentFormModal from "./DocumentFormModal";
import {CloseOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, message, Tag, Tooltip} from "antd";
import { EditOutlined } from "@ant-design/icons";
import EditDocumentModal from "./EditDocumentModal";
import {
    getDocumentsByClientId,
    deleteDocument,
    getAttachments,
    advanceDocumentStatus,
} from "../../api/api";

const AccessLevels = {
    NONE: "NONE",
    READ: "READ",
    CREATE: "CREATE",
    EDIT: "EDIT",
    DOWNLOAD: "DOWNLOAD",
    ADMIN: "ADMIN",
    OWNER: "OWNER",
    REVERT: "REVERT",
};

const DocGrid = ({
                     clientId,
                     unitId,
                     unitName,
                     serviceId,
                     serviceName,
                     periodId,
                     fiscalYear,
                     accessLevel,
                     roles,
                 }) => {
    const [documents, setDocuments] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const isAdmin = Array.isArray(roles) && roles.includes("ROLE_ADMIN");

    const canRead = isAdmin || ["READ", "EDIT", "DOWNLOAD", "OWNER", "REVERT"].includes(accessLevel);
    const canEdit = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canDelete = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canRevert = isAdmin || ["REVERT", "OWNER"].includes(accessLevel);
    const canCreate = isAdmin || ["CREATE", "OWNER", "ADMIN"].includes(accessLevel);
    const [editDocument, setEditDocument] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchDocuments = async () => {
        if (!clientId) return;
        try {
            const res = await getDocumentsByClientId(clientId);
            const documentList = res.data;

            const enrichedDocs = await Promise.all(
                documentList.map((doc) =>
                    getAttachments(doc.id)
                        .then((res) => ({
                            ...doc,
                            attachmentLinks: Array.isArray(res.data) ? res.data : [],
                        }))
                        .catch(() => ({
                            ...doc,
                            attachmentLinks: [],
                        }))
                )
            );

            const clean = enrichedDocs.map((doc) => ({
                ...doc,
                title: doc.title?.trim() || "—",
                documentNumber: doc.documentNumber || "—",
                fiscalYear: doc.periodFiscalYear  || "—",
                serviceName: doc.serviceName || "—",
                description: doc.description || "—",
                status: doc.status || "—",
            }));

            setDocuments(clean);
        } catch {
            message.error("❌ خطا در دریافت اسناد");
            setDocuments([]);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [clientId]);

    const handleDelete = async (id) => {
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((d) => d.id !== id));
        } catch {
            message.error("❌ خطا در حذف سند");
        }
    };

    const handleRevert = async (doc) => {
        try {
            await advanceDocumentStatus(doc.id);
            fetchDocuments();
        } catch {
            message.error("❌ خطا در تغییر وضعیت سند");
        }
    };

    const handleStatusChange = async (id) => {
        try {
            const res = await advanceDocumentStatus(id);
            const updated = res.data;
            setDocuments((prev) =>
                prev.map((doc) => (doc.id === updated.id ? updated : doc))
            );
        } catch {
            message.error("خطا در تغییر وضعیت سند");
        }
    };

    const columns = useMemo(
        () => [
            { field: "documentNumber", headerName: "شماره سند", minWidth: 120 },
            { field: "fiscalYear", headerName: "سال مالی", minWidth: 100 },
            { field: "description", headerName: "شرح", minWidth: 180 },
            {
                headerName: "وضعیت",
                field: "status",
                width: 120,
                cellRenderer: (params) => {
                    const status = params.value;
                    const color =
                        status === "DRAFT"
                            ? "default"
                            : status === "SUBMITTED"
                                ? "orange"
                                : "green";
                    const label =
                        status === "DRAFT"
                            ? "پیش‌نویس"
                            : status === "SUBMITTED"
                                ? "ثبت‌شده"
                                : "قطعی";
                    const next =
                        status === "DRAFT"
                            ? "ثبت‌شده"
                            : status === "SUBMITTED"
                                ? "قطعی"
                                : null;

                    return (
                        <Tooltip title={next ? `تغییر به ${next}` : "نهایی‌شده"}>
                            <Tag
                                color={color}
                                style={{ cursor: status === "FINALIZED" ? "not-allowed" : "pointer" }}
                                onClick={() =>
                                    status !== "FINALIZED" && handleStatusChange(params.data.id)
                                }
                            >
                                {label}
                            </Tag>
                        </Tooltip>
                    );
                },
            },
            // فقط داخل cellRenderer ستون actions این رو جایگزین کن 👇
            {
                field: "actions",
                headerName: "عملیات",
                minWidth: 160,
                cellRenderer: (params) => {
                    const isFinalized = params.data.status === "FINALIZED";

                    return (
                        <div style={{ display: "flex", gap: "6px" }}>
                            {canEdit && (
                                <>
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        title="ویرایش سند"
                                        onClick={() => {
                                            setEditDocument(params.data);
                                            setShowEditModal(true);
                                        }}
                                        disabled={isFinalized} // ❌ غیرفعال اگر سند قطعی شده
                                    />
                                    <Button
                                        type="text"
                                        icon={<CloseOutlined style={{ color: "red", fontSize: 16 }} />}
                                        title="حذف سند"
                                        onClick={() => handleDelete(params.data.id)}
                                        disabled={isFinalized} // ❌ غیرفعال اگر قطعی
                                    />
                                </>
                            )}
                        </div>
                    );
                }
            },
        ],
        [canEdit, canDelete, canRevert]
    );

    if (!canRead) {
        return <div style={{ color: "red" }}>⛔ شما مجاز به مشاهده اسناد نیستید!</div>;
    }

    return (
        <>
            <Tabel
                columnDefs={columns}
                rowData={documents}
                sortCol
                search
                excel
                csv
                filter
                actionElement={
                    canCreate && (
                        <Button
                            type="text"
                            icon={<PlusOutlined />}
                            style={{
                                fontSize: "1rem",
                                padding: "0 6px",
                                marginBottom: "0.5rem",
                                color: "#1890ff",
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
                    )
                }
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

export default DocGrid;
