import { useEffect, useMemo, useState } from "react";
import Tabel from "./Tabel";
import DocumentFormModal from "./DocumentFormModal";
import EditDocumentModal from "./EditDocumentModal";
import { Button, Tag, Tooltip, message } from "antd";
import { CloseOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
    getDocumentsByClientId,
    deleteDocument,
    getAttachments,
    advanceDocumentStatus,
} from "../../api/api";

import moment from "moment-jalaali";
moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

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
    const [editDocument, setEditDocument] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const isAdmin = Array.isArray(roles) && roles.includes("ROLE_ADMIN");
    const canRead = isAdmin || ["READ", "EDIT", "DOWNLOAD", "OWNER", "REVERT"].includes(accessLevel);
    const canEdit = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canCreate = isAdmin || ["CREATE", "OWNER", "ADMIN"].includes(accessLevel);

    const fetchDocuments = async () => {
        if (!clientId) return;
        try {
            const res = await getDocumentsByClientId(clientId);
            const documentList = res.data;

            const enriched = await Promise.all(
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

            const clean = enriched
                .map((doc) => ({
                    ...doc,
                    title: doc.title?.trim() || "—",
                    documentNumber: doc.documentNumber || "—",
                    fiscalYear: doc.periodFiscalYear || "—",
                    serviceName: doc.serviceName || "—",
                    description: doc.description || "—",
                    status: doc.status || "DRAFT",
                }))
                .sort((a, b) => a.documentNumber.localeCompare(b.documentNumber));

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
            setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        } catch {
            message.error("❌ خطا در حذف سند");
        }
    };

    const handleStatusChange = async (id) => {
        try {
            await advanceDocumentStatus(id);
            fetchDocuments(); // ✅ واکشی مجدد برای وضعیت جدید
        } catch {
            message.error("خطا در تغییر وضعیت سند");
        }
    };

    const columns = useMemo(() => [
        { field: "documentNumber", headerName: "شماره سند", minWidth: 120 },
        { field: "fiscalYear", headerName: "سال مالی", minWidth: 100 },
        { field: "serviceName", headerName: "سرویس", minWidth: 140 },
        { field: "description", headerName: "شرح", minWidth: 180 },
        {
            field: "documentTimestamp",
            headerName: "تاریخ سند",
            minWidth: 140,
            cellRenderer: (params) => {
                const date = moment(params.data.documentTimestamp);
                return date.isValid() ? date.format("jYYYY/jMM/jDD") : "—";
            },
        },
        {
            field: "status",
            headerName: "وضعیت",
            minWidth: 120,
            cellRenderer: (params) => {
                const status = params.data.status;
                const color =
                    status === "DRAFT" ? "default" :
                        status === "SUBMITTED" ? "orange" :
                            "green";
                const label =
                    status === "DRAFT" ? "پیش‌نویس" :
                        status === "SUBMITTED" ? "ثبت‌شده" :
                            "قطعی";
                const next =
                    status === "DRAFT" ? "ثبت‌شده" :
                        status === "SUBMITTED" ? "قطعی" :
                            null;

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
                                    disabled={isFinalized}
                                    style={isFinalized ? { color: "#ccc", cursor: "not-allowed" } : {}}
                                />
                                <Button
                                    type="text"
                                    icon={<CloseOutlined style={{ fontSize: 16, color: isFinalized ? "#ccc" : "red" }} />}
                                    title="حذف سند"
                                    onClick={() => handleDelete(params.data.id)}
                                    disabled={isFinalized}
                                    style={isFinalized ? { cursor: "not-allowed" } : {}}
                                />
                            </>
                        )}
                    </div>
                );
            },
        },
    ], [canEdit, documents.map(d => d.status).join(",")]);

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
