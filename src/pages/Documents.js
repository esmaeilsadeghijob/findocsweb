import { Table, Button, Space } from "antd";
import { useEffect, useState } from "react";
import { getDocuments } from "../api/api";
import UploadModal from "../components/UploadModal";
import AddDocumentModal from "../components/AddDocumentModal";
import AttachmentTable from "../components/AttachmentTable";

function Documents() {
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

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
                <Button type="primary" onClick={() => setShowAddModal(true)}>
                    افزودن سند جدید
                </Button>
            </Space>

            <Table
                rowKey="id"
                dataSource={docs}
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => (
                        <AttachmentTable documentId={record.id} />
                    ),
                    rowExpandable: () => true,
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
