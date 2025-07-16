import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    getDocumentsByClientId,
    deleteDocument,
    getAttachments,
    advanceDocumentStatus,
} from "../../api/api";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

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

    const isAdmin = Array.isArray(roles) && roles.includes("ROLE_ADMIN");

    const canRead =
        isAdmin ||
        ["READ", "EDIT", "DOWNLOAD", "OWNER", "REVERT"].includes(accessLevel);
    const canEdit = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canDelete = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canDownload = isAdmin || ["DOWNLOAD", "OWNER"].includes(accessLevel);
    const canRevert = isAdmin || ["REVERT", "OWNER"].includes(accessLevel);
    const canCreate = isAdmin || ["CREATE", "OWNER", "ADMIN"].includes(accessLevel);

    useEffect(() => {
        if (clientId) {
            getDocumentsByClientId(clientId)
                .then((res) => setDocuments(res.data))
                .catch(() => setDocuments([]));
        }
    }, [clientId]);

    const handleEdit = (doc) => {
        console.log("ویرایش سند:", doc);
    };

    const handleDownload = async (doc) => {
        try {
            const res = await getAttachments(doc.id);
            console.log("ضمیمه‌ها:", res.data);
        } catch (err) {
            console.error("خطا در دریافت ضمیمه‌ها:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            console.error("خطا در حذف سند:", err);
        }
    };

    const handleRevert = async (doc) => {
        try {
            await advanceDocumentStatus(doc.id);
            console.log("بازگردانی انجام شد");
        } catch (err) {
            console.error("خطا در بازگردانی:", err);
        }
    };

    const columns = useMemo(() => [
        {
            headerName: "شماره سند",
            field: "documentNumber",
            sortable: true,
            filter: true,
        },
        {
            headerName: "سال مالی",
            field: "fiscalYear",
            sortable: true,
            filter: true,
        },
        {
            headerName: "سرویس",
            field: "serviceName",
            sortable: true,
            filter: true,
        },
        {
            headerName: "شرح",
            field: "description",
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            headerName: "وضعیت",
            field: "status",
            sortable: true,
            filter: true,
        },
        {
            headerName: "عملیات",
            field: "actions",
            pinned: "left",
            maxWidth: 160,
            cellRenderer: (params) => {
                const doc = params.data;
                return (
                    <div style={{ display: "flex", gap: "6px" }}>
                        {canEdit && <button onClick={() => handleEdit(doc)}>✏️</button>}
                        {canDownload && <button onClick={() => handleDownload(doc)}>📥</button>}
                        {canDelete && <button onClick={() => handleDelete(doc.id)}>🗑️</button>}
                        {canRevert && <button onClick={() => handleRevert(doc)}>🔄</button>}
                    </div>
                );
            },
        },
    ], [canEdit, canDownload, canDelete, canRevert]);

    if (!canRead) {
        return <div style={{ color: "red" }}>⛔ شما مجاز به مشاهده اسناد نیستید!</div>;
    }

    return (
        <div style={{ width: "100%" }}>
            {canCreate && (
                <div style={{ marginBottom: "1rem" }}>
                    <button
                        style={{
                            backgroundColor: "#1890ff",
                            color: "#fff",
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                        onClick={() => console.log("ثبت سند")}
                    >
                        ثبت سند جدید
                    </button>
                </div>
            )}

            <div className="ag-theme-alpine" style={{ height: 500 }}>
                <AgGridReact
                    rowData={documents}
                    columnDefs={columns}
                    pagination={true}
                    animateRows={true}
                    domLayout="autoHeight"
                />
            </div>
        </div>
    );
};

export default DocGrid;
