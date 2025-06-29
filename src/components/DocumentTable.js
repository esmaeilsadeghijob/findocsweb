import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Tag,
    Tooltip,
    message,
} from "antd";
import {
    FileAddOutlined,
    DeleteOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    getDocuments,
    deleteDocument,
} from "../api/api";
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
                const filtered = res.data.filter((doc) => doc.clientId === clientId);
                setDocuments(filtered);
            })
            .catch(() => {
                setDocuments([]);
                message.error("خطا در دریافت اسناد");
            });

        console.log("::::::::::::::::");
        console.log("::::::::::::::::");
        console.log(documents);
        console.log("::::::::::::::::");

    };

    useEffect(() => {
        if (clientId) {
            fetchDocs();
        }
    }, [clientId]);

    const handleDelete = async (id) => {
        const confirm = window.confirm("آیا از حذف این سند مطمئن هستید؟");
        if (!confirm) return;
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
            await fetch(`/api/documents/${id}/status`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            fetchDocs();
        } catch {
            message.error("خطا در تغییر وضعیت سند");
        }
    };

    const columns = [
        { title: "شماره", dataIndex: "documentNumber" },
        {
            title: "سال مالی",
            render: (_, record) => record.periodFiscalYear || "—",
        },
        {
            title: "واحد",
            render: (_, record) => record.unitName || "—",
        },
        {
            title: "سرویس",
            render: (_, record) => record.serviceName || "—",
        },
        {
            title: "شرح",
            dataIndex: "description",
        },
        {
            title: "وضعیت",
            dataIndex: "status",
            render: (status, record) => {
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
                            style={{
                                cursor: status === "FINALIZED" ? "not-allowed" : "pointer",
                            }}
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
            title: "ضمیمه",
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<UploadOutlined />}
                    onClick={() => setSelectedDoc(record.id)}
                >
                    فایل
                </Button>
            ),
        },
        {
            title: "حذف",
            render: (_, record) =>
                record.status !== "FINALIZED" && (
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record.id)}
                    />
                ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 12 }}>
                <Button icon={<FileAddOutlined />} onClick={() => setShowModal(true)}>
                    افزودن سند
                </Button>
            </div>

            <Table
                size="small"
                rowKey="id"
                dataSource={documents}
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => (
                        <AttachmentPanel documentId={record.id} />
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
