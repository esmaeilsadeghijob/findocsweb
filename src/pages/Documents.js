import { Table, Button, Space } from "antd";
import { useEffect, useState } from "react";
import { getDocuments } from "../api/api";
import UploadModal from "../components/UploadModal";
import AddDocumentModal from "../components/AddDocumentModal";
import AttachmentTable from "../components/AttachmentTable";
import {LeftOutlined, PlusCircleOutlined, RightOutlined} from "@ant-design/icons";

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
                        color: "#222222",               // رنگ متن نوک‌مدادی
                        borderColor: "#222222",         // رنگ خط‌چین
                        height: 48,
                        fontSize: "1rem",
                        backgroundColor: "#f9f9f9",  // زمینه روشن و ظریف
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
                        <AttachmentTable documentId={record.id} />
                    ),
                    rowExpandable: () => true,
                }}
                pagination={{
                    pageSize: 8,
                    position: ["bottomCenter"],
                    showSizeChanger: false,
                    prevIcon: <RightOutlined />, // چون در rtl به سمت چپ نشون داده میشه
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
