import { useEffect, useMemo, useState } from "react";
import Tabel from "./Tabel";
import TabelActionBtn from "./TabelActionBtn";
import DocumentFormModal from "./DocumentFormModal"; // ✅ مودال جدید ثبت سند
import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import {
    getDocumentsByClientId,
    deleteDocument,
    getAttachments,
    advanceDocumentStatus,
} from "../../api/api";

// اگر واحد و سرویس در مسیر بالا قابل دستیابی هستند، اینا رو از props یا context بگیر
const currentServiceName = "سرویس مالیات";  // ⬅️ سرویس جاری
const currentUnitName = "واحد مرکزی";       // ⬅️ واحد جاری

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

const DocGrid = ({ clientId, accessLevel, roles }) => {
    const [documents, setDocuments] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const isAdmin = Array.isArray(roles) && roles.includes("ROLE_ADMIN");

    const canRead = isAdmin || ["READ", "EDIT", "DOWNLOAD", "OWNER", "REVERT"].includes(accessLevel);
    const canEdit = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canDelete = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canDownload = isAdmin || ["DOWNLOAD", "OWNER"].includes(accessLevel);
    const canRevert = isAdmin || ["REVERT", "OWNER"].includes(accessLevel);
    const canCreate = isAdmin || ["CREATE", "OWNER", "ADMIN"].includes(accessLevel);

    const fetchDocuments = () => {
        if (!clientId) return;
        getDocumentsByClientId(clientId)
            .then((res) => {
                const cleanDocuments = res.data.map((doc) => ({
                    ...doc,
                    documentNumber: doc.documentNumber ? String(doc.documentNumber) : "",
                    fiscalYear: doc.fiscalYear ? String(doc.fiscalYear) : "",
                    serviceName: doc.serviceName || "",
                    description: doc.description || "",
                    status: doc.status || "",
                }));
                setDocuments(cleanDocuments);
            })
            .catch(() => setDocuments([]));
    };

    useEffect(() => {
        fetchDocuments();
    }, [clientId]);

    const handleEdit = (doc) => console.log("ویرایش سند:", doc);
    const handleDelete = async (id) => {
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            console.error("خطا در حذف سند:", err);
        }
    };
    const handleDownload = async (doc) => {
        try {
            const res = await getAttachments(doc.id);
            console.log("ضمیمه‌ها:", res.data);
        } catch (err) {
            console.error("خطا در دریافت ضمیمه‌ها:", err);
        }
    };
    const handleRevert = async (doc) => {
        try {
            await advanceDocumentStatus(doc.id);
            fetchDocuments();
        } catch (err) {
            console.error("خطا در بازگردانی:", err);
        }
    };

    const columns = useMemo(() => [
        { field: "documentNumber", headerName: "شماره سند", sortable: true, filter: "agTextColumnFilter" },
        { field: "fiscalYear", headerName: "سال مالی", sortable: true, filter: "agTextColumnFilter" },
        { field: "serviceName", headerName: "سرویس", sortable: true, filter: "agTextColumnFilter" },
        { field: "description", headerName: "شرح", sortable: true, filter: "agTextColumnFilter" },
        { field: "status", headerName: "وضعیت", sortable: true, filter: "agTextColumnFilter" },
        {
            headerName: "عملیات",
            field: "actions",
            pinned: "left",
            maxWidth: 160,
            cellRenderer: (params) => (
                <div style={{ display: "flex", gap: "6px" }}>
                    {canEdit && (
                        <TabelActionBtn
                            title="ویرایش"
                            type="edit"
                            onClick={() => handleEdit(params.data)}
                        />
                    )}
                    {canDownload && (
                        <TabelActionBtn
                            title="دانلود"
                            type="view"
                            onClick={() => handleDownload(params.data)}
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
    ], [canEdit, canDownload, canDelete, canRevert]);

    if (!canRead) {
        return <div style={{ color: "red" }}>⛔ شما مجاز به مشاهده اسناد نیستید!</div>;
    }

    return (
        <>
            <Tabel
                columnDefs={columns}
                rowData={documents}
                sortCol
                search={true}
                excel={true}
                csv={true}
                filter={true}
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
                            onClick={() => setShowModal(true)}
                        >
                            ثبت سند جدید
                        </Button>
                    )
                }
            />

            {showModal && (
                <DocumentFormModal
                    visible={true}
                    clientId={clientId}
                    defaultService={currentServiceName}
                    defaultUnit={currentUnitName}
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
