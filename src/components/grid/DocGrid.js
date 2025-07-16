import { useEffect, useMemo, useState } from "react";
import Tabel from "./Tabel";
import TabelActionBtn from "./TabelActionBtn";
import DocumentFormModal from "./DocumentFormModal";
import { PlusOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
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
                            attachmentLinks: res.data || [],
                        }))
                        .catch(() => ({
                            ...doc,
                            attachmentLinks: [],
                        }))
                )
            );

            const clean = enrichedDocs.map((doc) => ({
                ...doc,
                documentNumber: doc.documentNumber ? String(doc.documentNumber) : "",
                fiscalYear: doc.fiscalYear ? String(doc.fiscalYear) : "",
                serviceName: doc.serviceName || "",
                description: doc.description || "",
                status: doc.status || "",
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

    const columns = useMemo(() => [
        { field: "documentNumber", headerName: "شماره سند" },
        { field: "fiscalYear", headerName: "سال مالی" },
        { field: "serviceName", headerName: "سرویس" },
        { field: "description", headerName: "شرح" },
        { field: "status", headerName: "وضعیت" },
        {
            field: "actions",
            headerName: "عملیات",
            cellRenderer: (params) => (
                <div style={{ display: "flex", gap: "6px" }}>
                    {canEdit && (
                        <TabelActionBtn
                            title="ویرایش"
                            type="edit"
                            onClick={() => console.log("ویرایش", params.data)}
                        />
                    )}
                    {canDelete && (
                        <TabelActionBtn
                            title="حذف"
                            type="delete"
                            onClick={() => handleDelete(params.data.id)}
                        />
                    )}
                    {canRevert && (
                        <TabelActionBtn
                            title="بازگردانی"
                            type="restore"
                            onClick={() => handleRevert(params.data)}
                        />
                    )}
                </div>
            ),
        },
    ], [canEdit, canDelete, canRevert]);

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
        </>
    );
};

export default DocGrid;
