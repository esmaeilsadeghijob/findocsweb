import { Table, Button, Space, message, Input, Row, Col } from "antd";
import { useEffect, useState } from "react";
import {
    getDocuments,
    deleteDocument,
} from "../api/api";
import UploadModal from "../components/UploadModal";
import AddDocumentModal from "../components/AddDocumentModal";
import AttachmentPanel from "../components/AttachmentPanel";
import {
    LeftOutlined,
    PlusCircleOutlined,
    RightOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";

function Documents() {
    const [docs, setDocs] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedDocId, setExpandedDocId] = useState(null);

    const fetchDocs = () =>
        getDocuments()
            .then((res) => setDocs(res.data))
            .catch(() => setDocs([]));

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleDelete = async (id) => {
        const confirm = window.confirm("آیا از حذف این سند مطمئن هستید؟");
        if (!confirm) return;

        try {
            await deleteDocument(id);
            message.success("سند با موفقیت حذف شد");
            fetchDocs();
        } catch {
            message.error("خطا در حذف سند");
        }
    };

    const filteredDocs = docs.filter((doc) => {
        const search = searchText.toLowerCase();
        return Object.values(doc).some((val) =>
            typeof val === "string"
                ? val.toLowerCase().includes(search)
                : typeof val === "object" && val !== null
                    ? Object.values(val).some((v) =>
                        typeof v === "string"
                            ? v.toLowerCase().includes(search)
                            : false
                    )
                    : false
        );
    });

    const columns = [
        { title: "شماره سند", dataIndex: "documentNumber" },
        {
            title: "سال مالی",
            render: (_, record) => record.period?.fiscalYear || "—",
        },
        {
            title: "نام مشتری",
            render: (_, record) => record.client?.name || "—",
        },
        {
            title: "واحد",
            render: (_, record) => record.unit?.name || "—",
        },
        {
            title: "سرویس",
            render: (_, record) => record.service?.name || "—",
        },
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
        {
            title: "حذف",
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id)}
                />
            ),
        },
    ];

    return (
        <>
            <Row
                align="middle"
                style={{ marginBottom: "1rem" }}
                gutter={[16, 16]}
            >
                <Col span={6}>
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
                </Col>

                <Col span={12} style={{ textAlign: "center" }}>
                    <Input
                        placeholder="جست‌وجو در همه‌ ستون‌ها..."
                        prefix={<SearchOutlined />}
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                            width: 500,
                            height: 45,       // 👈 ارتفاع بیشتر
                            fontSize: "1rem", // 👈 متن خواناتر
                            paddingInline: 12,
                        }}
                    />
                </Col>

                <Col span={6} style={{ textAlign: "end" }}>

                </Col>
            </Row>

            <Table
                rowKey="id"
                dataSource={filteredDocs}
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => (
                        <AttachmentPanel documentId={record.id} />
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
                    onSuccess={() => {
                        setExpandedDocId(selectedDoc);
                        setSelectedDoc(null);
                    }}
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
