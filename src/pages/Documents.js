import { Table, Button, Space } from "antd";
import { useEffect, useState } from "react";
import { getDocuments } from "../api/api";
import UploadModal from "../components/UploadModal";
import AddDocumentModal from "../components/AddDocumentModal";
import AttachmentPanel from "../components/AttachmentPanel"; // 👈 استفاده از کامپوننت جدید
import {
    LeftOutlined,
    PlusCircleOutlined,
    RightOutlined,
} from "@ant-design/icons";

function Documents() {
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedDocId, setExpandedDocId] = useState(null); // 👈 برای کنترل ردیف باز شده

    const fetchDocs = () =>
        getDocuments()
            .then((res) => setDocs(res.data))
            .catch(() => setDocs([]));

    useEffect(() => {
        fetchDocs();
    }, []);

    const columns = [
        { title: "شماره سند", dataIndex: "documentNumber" },
        { title: "سال مالی", dataIndex: "fiscalYear" },
        { title: "شرح سند", dataIndex: "description" },
        {
            title: "ایجادکننده",
            dataIndex: "createdBy",
            render: (user) => user || "نامشخص",
        },
        {
            title: "ضمیمه",
            render: (_, record) => (
                <Button type="link" onClick={() => setSelectedDoc(record.id)}>
                    بارگذاری فایل
                </Button>
            ),
        },
    ];

    return (
        <>
            <Space style={{ marginBottom: "1rem" }}>
                <Button
                    type="dashed"
                    icon={<PlusCircleOutlined />}
                    size="large"
                    onClick={() => setShowAddModal(true)}
                    style={{
                        borderStyle: "dashed",
                        paddingInline: 28,
                        fontWeight: "bold",
                        color: "#222222",
                        borderColor: "#222222",
                        height: 48,
                        fontSize: "1rem",
                        backgroundColor: "#f9f9f9",
                    }}
                >
                    افزودن سند جدید
                </Button>
            </Space>

            <Table
                rowKey="id"
                dataSource={docs}
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => (
                        <AttachmentPanel documentId={record.id} /> // ✅ پیش‌نمایش حرفه‌ای در جدول
                    ),
                    expandedRowKeys: expandedDocId ? [expandedDocId] : [],
                    onExpand: (expanded, record) => {
                        setExpandedDocId(expanded ? record.id : null);
                    },
                    rowExpandable: () => true,
                }}
                pagination={{
                    pageSize: 8,
                    position: ["bottomCenter"],
                    showSizeChanger: false,
                    prevIcon: <RightOutlined />,
                    nextIcon: <LeftOutlined />,
                }}
            />

            {selectedDoc && (
                <UploadModal
                    documentId={selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                />
            )}

            {showAddModal && (
                <AddDocumentModal
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchDocs();
                    }}
                    onCancel={() => setShowAddModal(false)}
                />
            )}
        </>
    );
}

export default Documents;
