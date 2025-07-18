import {useEffect, useMemo, useState} from "react";
import Tabel from "./Tabel";
import DocumentFormModal from "./DocumentFormModal";
import EditDocumentModal from "./EditDocumentModal";
import {Button, Tag, Tooltip, message, Space} from "antd";
import {
    CloseOutlined,
    EditOutlined,
    PlusOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import {
    getDocumentsByClientId,
    getDocumentsByFilter,
    deleteDocument,
    getAttachments,
    advanceDocumentStatus,
    revertDocumentStatus,
    getPermissions
} from "../../api/api";
import moment from "moment-jalaali";

moment.loadPersian({usePersianDigits: true, dialect: "persian-modern"});

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
                     currentUser
                 }) => {
    const [documents, setDocuments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editDocument, setEditDocument] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const isAdmin = Array.isArray(roles) && roles.includes("ROLE_ADMIN");
    const canReadGlobal =
        isAdmin || ["READ", "EDIT", "DOWNLOAD", "OWNER", "REVERT", "ADMIN"].includes(accessLevel);
    const canCreate =
        isAdmin || ["CREATE", "OWNER", "ADMIN"].includes(accessLevel);

    const hideActionsColumn = ["READ", "CREATE", "NONE"].includes(accessLevel) && !isAdmin;

    const fetchDocuments = async () => {
        if (!clientId) return;
        try {
            const [resDocs, resPerm] = await Promise.all([
                // getDocumentsByClientId(clientId),
                getDocumentsByFilter(clientId, unitId, serviceId),
                getPermissions()
            ]);
            const permissions = Array.isArray(resPerm.data) ? resPerm.data : [];

            const enriched = await Promise.all(
                resDocs.data.map(async (doc) => {
                    const perm =
                        permissions.find((p) => p.documentId === doc.id && p.userId === currentUser?.id) ||
                        permissions.find((p) => p.unitId === unitId && p.userId === currentUser?.id);

                    const attachments = await getAttachments(doc.id)
                        .then((res) => res.data)
                        .catch(() => []);
                    return {
                        ...doc,
                        attachmentLinks: attachments,
                        title: doc.title?.trim() || "—",
                        documentNumber: doc.documentNumber || "—",
                        fiscalYear: doc.periodFiscalYear || "—",
                        serviceName: doc.serviceName || "—",
                        description: doc.description || "—",
                        status: doc.status || "DRAFT",
                        accessLevel: perm?.accessLevel || "NONE"
                    };
                })
            );

            setDocuments(
                enriched.sort((a, b) => a.documentNumber.localeCompare(b.documentNumber))
            );
        } catch {
            message.error(" خطا در دریافت اسناد");
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
            message.error(" خطا در حذف سند");
        }
    };

    const handleStatusChange = async (id) => {
        try {
            await advanceDocumentStatus(id);
            fetchDocuments();
        } catch {
            message.error(" خطا در تغییر وضعیت سند");
        }
    };

    const handleRevertStatus = async (id) => {
        try {
            await revertDocumentStatus(id);
            fetchDocuments();
            message.success(" وضعیت سند بازگردانی شد");
        } catch {
            message.error(" خطا در بازگردانی وضعیت سند");
        }
    };

    const isLimitedAccessGlobal = ["READ", "CREATE", "NONE"].includes(accessLevel) && !isAdmin;

    const statusColumn = isLimitedAccessGlobal
        ? {
            field: "status",
            headerName: "وضعیت",
            minWidth: 160,
            cellRenderer: (params) => {
                const { status } = params.data;
                const label =
                    status === "FINALIZED"
                        ? "قطعی"
                        : status === "SUBMITTED"
                            ? "ثبت‌شده"
                            : "پیش‌نویس";
                const color =
                    status === "FINALIZED"
                        ? "green"
                        : status === "SUBMITTED"
                            ? "orange"
                            : "default";

                return (
                    <Tag color={color} style={{ opacity: 0.6, cursor: "default" }}>
                        {label}
                    </Tag>
                );
            }
        }
        : {
            field: "status",
            headerName: "وضعیت",
            minWidth: 160,
            cellRenderer: (params) => {
                const { status, accessLevel } = params.data;
                const isFinalized = status === "FINALIZED";
                const label =
                    isFinalized ? "قطعی" : status === "SUBMITTED" ? "ثبت‌شده" : "پیش‌نویس";
                const color =
                    isFinalized ? "green" : status === "SUBMITTED" ? "orange" : "default";

                const allowAdvance =
                    !isFinalized && (isAdmin || ["OWNER", "ADMIN"].includes(accessLevel));

                const allowRevert =
                    isFinalized && (isAdmin || ["OWNER", "ADMIN", "REVERT"].includes(accessLevel));

                return (
                    <Space>
                        <Tooltip title={allowAdvance ? "تغییر وضعیت سند" : ""}>
                            <Tag
                                color={color}
                                style={{ cursor: allowAdvance ? "pointer" : "default" }}
                                onClick={() => {
                                    if (allowAdvance) {
                                        handleStatusChange(params.data.id);
                                    }
                                }}
                            >
                                {label}
                            </Tag>
                        </Tooltip>

                        {allowRevert && (
                            <Tooltip title="بازگردانی وضعیت سند">
                                <Button
                                    type="text"
                                    icon={<ReloadOutlined style={{ fontSize: 20, color: "#fa8c16" }} />}
                                    onClick={() => handleRevertStatus(params.data.id)}
                                />
                            </Tooltip>
                        )}
                    </Space>
                );
            }
        };


    const columns = useMemo(() => {
        const baseColumns = [
            { field: "documentNumber", headerName: "شماره سند", minWidth: 120 },
            { field: "fiscalYear", headerName: "سال مالی", minWidth: 100 },
            // { field: "serviceName", headerName: "سرویس", minWidth: 140 },
            { field: "description", headerName: "شرح", minWidth: 180 },
            {
                field: "documentTimestamp",
                headerName: "تاریخ سند",
                minWidth: 140,
                cellRenderer: (params) => {
                    const date = moment(params.data.documentTimestamp);
                    return date.isValid() ? date.format("jYYYY/jMM/jDD") : "—";
                }
            },
            statusColumn
        ];

        // اضافه‌کردن ستون عملیات فقط برای کاربران مجاز
        if (!isLimitedAccessGlobal) {
            baseColumns.push({
                field: "actions",
                headerName: "عملیات",
                minWidth: 160,
                cellRenderer: (params) => {
                    const { accessLevel, status } = params.data;
                    const isFinalized = status === "FINALIZED";
                    const allowEdit = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);
                    const allowDelete = isAdmin || ["EDIT", "OWNER"].includes(accessLevel);

                    return (
                        <div style={{ display: "flex", gap: "6px" }}>
                            {allowEdit && (
                                <>
                                    <Button
                                        type="text"
                                        icon={
                                            <EditOutlined
                                                style={{
                                                    fontSize: 16,
                                                    color: isFinalized ? "#ccc" : "#1890ff"
                                                }}
                                            />
                                        }
                                        title="ویرایش سند"
                                        onClick={() => {
                                            setEditDocument(params.data);
                                            setShowEditModal(true);
                                        }}
                                        disabled={isFinalized}
                                        style={isFinalized ? { cursor: "not-allowed" } : {}}
                                    />
                                    <Button
                                        type="text"
                                        icon={
                                            <CloseOutlined
                                                style={{
                                                    fontSize: 16,
                                                    color: isFinalized ? "#ccc" : "red"
                                                }}
                                            />
                                        }
                                        title="حذف سند"
                                        onClick={() => handleDelete(params.data.id)}
                                        disabled={isFinalized || !allowDelete}
                                        style={
                                            isFinalized || !allowDelete ? { cursor: "not-allowed" } : {}
                                        }
                                    />
                                </>
                            )}
                        </div>
                    );
                }
            });
        }

        return baseColumns;
    }, [documents, accessLevel]);

    if (!canReadGlobal) {
        return <div style={{color: "red"}}> شما مجاز به مشاهده اسناد نیستید!</div>;
    }

    return (
        <>
            <Tabel
                columnDefs={columns}
                rowData={documents}
                // canManageAttachments={!["READ", "CREATE", "NONE"].includes(accessLevel) && !isAdmin}
                canManageAttachments={!["READ", "CREATE", "NONE"].includes(accessLevel)}
                sortCol
                search
                excel
                csv
                filter
                actionElement={
                    canCreate && (
                        <Button
                            type="text"
                            icon={<PlusOutlined/>}
                            style={{
                                fontSize: "1rem",
                                padding: "0 6px",
                                marginBottom: "0.5rem",
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
                    )
                }
            />

            {showModal && (
                <DocumentFormModal
                    visible clientId={clientId} unitId={unitId} unitName={unitName}
                    serviceId={serviceId}
                    serviceName={serviceName}
                    periodId={periodId}
                    defaultPeriodLabel={fiscalYear}
                    onCancel={() => setShowModal(false)} onSuccess={() => {
                    setShowModal(false);
                    fetchDocuments();
                }}/>)}

            {showEditModal && editDocument && (
                <EditDocumentModal
                    visible={showEditModal}
                    editData={editDocument} onCancel={() => {
                    setShowEditModal(false);
                    setEditDocument(null);
                }} onSuccess={() => {
                    setShowEditModal(false);
                    setEditDocument(null);
                    fetchDocuments();
                }}/>)} </>);
};

export default DocGrid;