import { useEffect, useMemo, useState } from "react";
import Tabel from "./Tabel";
import TabelActionBtn from "./TabelActionBtn";
import AppButton from "./Button";
import {
    getDocumentsByClientId,
    deleteDocument,
    getAttachments,
    advanceDocumentStatus,
} from "../../api/api";
import {PlusOutlined} from "@ant-design/icons";
import {Button} from "antd";

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

    const canRead = isAdmin || ["READ", "EDIT", "DOWNLOAD", "OWNER", "REVERT"].includes(accessLevel);
    const canEdit = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canDelete = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
    const canDownload = isAdmin || ["DOWNLOAD", "OWNER"].includes(accessLevel);
    const canRevert = isAdmin || ["REVERT", "OWNER"].includes(accessLevel);
    const canCreate = isAdmin || ["CREATE", "OWNER", "ADMIN"].includes(accessLevel);

    useEffect(() => {
        if (clientId) {
            getDocumentsByClientId(clientId)
                .then((res) => {
                    // تبدیل مقادیر عددی به رشته برای سازگاری با فیلتر سریع
                    const cleanDocuments = res.data.map(doc => ({
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
        }
    }, [clientId]);

    const handleEdit = (doc) => console.log("ویرایش سند:", doc);
    const handleDelete = async (id) => {
        try {
            await deleteDocument(id);
            setDocuments(prev => prev.filter(d => d.id !== id));
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
            console.log("بازگردانی موفق");
        } catch (err) {
            console.error("خطا در بازگردانی:", err);
        }
    };

    const columns = useMemo(() => [
        {
            field: "documentNumber",
            headerName: "شماره سند",
            sortable: true,
            filter: "agTextColumnFilter",
        },
        {
            field: "fiscalYear",
            headerName: "سال مالی",
            sortable: true,
            filter: "agTextColumnFilter",
        },
        {
            field: "serviceName",
            headerName: "سرویس",
            sortable: true,
            filter: "agTextColumnFilter",
        },
        {
            field: "description",
            headerName: "شرح",
            sortable: true,
            filter: "agTextColumnFilter",
        },
        {
            field: "status",
            headerName: "وضعیت",
            sortable: true,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "عملیات",
            field: "actions",
            pinned: "left",
            maxWidth: 160,
            cellRenderer: (params) => (
                <div style={{ display: "flex", gap: "6px" }}>
                    {canEdit && <TabelActionBtn title="ویرایش" type="edit" onClick={() => handleEdit(params.data)} />}
                    {canDownload && <TabelActionBtn title="دانلود" type="view" onClick={() => handleDownload(params.data)} />}
                    {canDelete && <TabelActionBtn title="حذف" type="delete" onClick={() => handleDelete(params.data.id)} />}
                    {canRevert && <TabelActionBtn title="بازگردانی" type="restore" onClick={() => handleRevert(params.data)} />}
                </div>
            ),
        },
    ], [canEdit, canDownload, canDelete, canRevert]);

    if (!canRead) {
        return <div style={{ color: "red" }}>⛔ شما مجاز به مشاهده اسناد نیستید!</div>;
    }

    return (
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
                    // <AppButton
                    //     title="ثبت سند جدید"
                    //     color="blue"
                    //     onClick={() => console.log("ثبت سند")}
                    // />
                    <Button
                        type="text"
                        icon={<PlusOutlined/>}
                        style={{
                            fontSize: "1rem",
                            // fontFamily: "FarBaseet",
                            padding: "0 6px",
                            marginBottom: "0.5rem",
                            color: "#1890ff",
                            // width: "100%",
                            // textAlign: "right",
                        }}
                        // onClick={() => setShowClientModal(true)}
                    >
                        ثبت سند جدید
                    </Button>
                )
            }
        />
    );
};

export default DocGrid;
