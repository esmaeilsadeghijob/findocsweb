import {useEffect, useState} from "react";
import {Button, message, Space, Table, Tag, Tooltip,} from "antd";
import {DeleteOutlined, FileAddOutlined, FileExcelOutlined, UploadOutlined,} from "@ant-design/icons";
import {advanceDocumentStatus, deleteDocument, getDocuments,} from "../api/api";
import AddDocumentModal from "./AddDocumentModal";
import UploadModal from "./UploadModal";
import AttachmentPanel from "./AttachmentPanel";

function DocumentTable({ clientId }) {
    const [documents, setDocuments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const fetchDocs = () => {
        getDocuments()
            .then((res) => {
                const filtered = res.data
                    .filter((doc) =>
                        doc.clientId === clientId && doc.accessLevel !== "NONE"
                    );
                setDocuments(filtered);
            })
            .catch(() => {
                setDocuments([]);
                message.error("خطا در دریافت اسناد");
            });
    };

    useEffect(() => {
        if (clientId) fetchDocs();
    }, [clientId]);

    const handleDelete = async (id) => {
        if (!window.confirm("آیا از حذف این سند مطمئن هستید؟")) return;
        try {
            await deleteDocument(id);
            message.success("سند حذف شد");
            fetchDocs();
        } catch {
            message.error("خطا در حذف سند");
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

    const exportToExcel = async (id) => {
        try {
            // باید به API مربوطه وصل شود
            message.success(`سند ${id} به اکسل ارسال شد`);
        } catch {
            message.error("خطا در ارسال به اکسل");
        }
    };

    const columns = [
        { title: "شماره", dataIndex: "documentNumber" },
        { title: "سال مالی", render: (_, r) => r.periodFiscalYear || "—" },
        { title: "واحد", render: (_, r) => r.unitName || "—" },
        { title: "سرویس", render: (_, r) => r.serviceName || "—" },
        { title: "شرح", dataIndex: "description" },
        {
            title: "وضعیت",
            render: (_, record) => {
                const status = record.status;
                const color =
                    status === "DRAFT" ? "default"
                        : status === "SUBMITTED" ? "orange"
                            : "green";

                const label =
                    status === "DRAFT" ? "پیش‌نویس"
                        : status === "SUBMITTED" ? "ثبت‌شده"
                            : "قطعی";

                const next =
                    status === "DRAFT" ? "ثبت‌شده"
                        : status === "SUBMITTED" ? "قطعی"
                            : null;

                return (
                    <Tooltip title={next ? `تغییر به ${next}` : "نهایی‌شده"}>
                        <Tag
                            color={color}
                            style={{ cursor: status === "FINALIZED" ? "not-allowed" : "pointer" }}
                            onClick={() => {
                                if (status !== "FINALIZED") handleStatusChange(record.id);
                            }}
                        >
                            {label}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: "سطح دسترسی",
            render: (_, r) => <Tag color="blue">{r.accessLevel}</Tag>,
        },
        {
            title: "عملیات",
            render: (_, record) => {
                const access = record.accessLevel;
                const disabled = access === "NONE";

                return (
                    <Space>
                        {["CREATE", "EDIT", "ADMIN", "OWNER"].includes(access) && record.status !== "FINALIZED" && (
                            <Button
                                icon={<UploadOutlined />}
                                onClick={() => setSelectedDoc(record.id)}
                            >
                                فایل
                            </Button>
                        )}

                        {["EDIT", "OWNER"].includes(access) && record.status !== "FINALIZED" && (
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => handleDelete(record.id)}
                            />
                        )}

                        {["EXPORT", "ADMIN", "OWNER"].includes(access) && (
                            <Button
                                icon={<FileExcelOutlined />}
                                onClick={() => exportToExcel(record.id)}
                            />
                        )}
                    </Space>
                );
            },
        },
        {
            title: "پیوست‌ها",
            align: "center",
            render: (_, record) => (
                <Tooltip title="نمایش ضمیمه‌ها">
                    <Button
                        style={{ fontSize: 20, width: 36, height: 36, padding: 0 }}
                        icon={expandedId === record.id ? "−" : "+"}
                        onClick={() =>
                            setExpandedId(expandedId === record.id ? null : record.id)
                        }
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 12 }}>
                {["CREATE", "ADMIN", "OWNER"].includes(documents[0]?.accessLevel) && (
                    <Button icon={<FileAddOutlined />} onClick={() => setShowModal(true)}>
                        افزودن سند
                    </Button>
                )}
            </div>

            <Table
                size="small"
                rowKey="id"
                dataSource={documents}
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => (
                        <AttachmentPanel
                            documentId={record.id}
                            status={record.status}
                        />
                    ),
                    expandedRowKeys: expandedId ? [expandedId] : [],
                    onExpand: (expanded, record) => {
                        setExpandedId(expanded ? record.id : null);
                    },
                }}
                pagination={false}
            />

            {showModal && (
                <AddDocumentModal
                    clientId={clientId}
                    onCancel={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchDocs();
                    }}
                />
            )}

            {selectedDoc && (
                <UploadModal
                    documentId={selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                    onSuccess={() => {
                        setExpandedId(selectedDoc);
                        setSelectedDoc(null);
                    }}
                />
            )}
        </>
    );
}

export default DocumentTable;
