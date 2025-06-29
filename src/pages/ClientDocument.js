import { useEffect, useState } from "react";
import {
    Table,
    Button,
    message,
    Input,
    Row,
    Col,
    Spin,
    Popconfirm,
} from "antd";
import {
    UserAddOutlined,
    FileAddOutlined,
    SearchOutlined,
    DeleteOutlined,
    EditOutlined,
} from "@ant-design/icons";
import {
    getClients,
    deleteClient,
} from "../api/api";
import ClientCreateModal from "../components/ClientCreateModal";
import AddDocumentModal from "../components/AddDocumentModal";
import DocumentTable from "../components/DocumentTable";

function ClientDocument() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClientForDoc, setSelectedClientForDoc] = useState(null);
    const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchClients = () => {
        setLoading(true);
        getClients()
            .then((res) => {
                const activeClients = res.data.filter((c) => c.active !== false);
                setClients(activeClients);
            })
            .catch(() => {
                setClients([]);
                message.error("خطا در دریافت مشتری‌ها");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleDelete = (id) => {
        deleteClient(id)
            .then(() => {
                message.success("مشتری غیرفعال شد");
                fetchClients();
            })
            .catch(() => {
                message.error("حذف مشتری با خطا مواجه شد");
            });
    };

    const handleEdit = (record) => {
        setSelectedClientForEdit(record);
    };

    const filteredClients = clients.filter((client) =>
        Object.values(client).some((val) =>
            typeof val === "string"
                ? val.toLowerCase().includes(searchText.toLowerCase())
                : false
        )
    );

    const columns = [
        {
            title: "شناسه مشتری",
            dataIndex: "identifierCode",
        },
        {
            title: "سرویس",
            dataIndex: "serviceName",
        },
        {
            title: "واحد",
            dataIndex: "unitName",
        },
        {
            title: "عملیات",
            render: (_, record) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="آیا از غیرفعالسازی مطمئنی؟"
                        onConfirm={() => handleDelete(record.id)}
                        okText="بله"
                        cancelText="لغو"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                    <Button
                        icon={<FileAddOutlined />}
                        onClick={() => setSelectedClientForDoc(record)}
                    >
                        سند جدید
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Row
                align="middle"
                style={{ marginBottom: "1rem" }}
                gutter={[16, 16]}
                justify="space-between"
            >
                <Col>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => setShowClientModal(true)}
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
                        افزودن مشتری
                    </Button>
                </Col>

                <Col flex="1" style={{ textAlign: "center" }}>
                    <Input
                        placeholder="جست‌وجو در مشتری‌ها..."
                        prefix={<SearchOutlined />}
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                            width: 400,
                            height: 45,
                            fontSize: "1rem",
                            paddingInline: 12,
                        }}
                    />
                </Col>
            </Row>

            {loading ? (
                <Spin />
            ) : (
                <Table
                    rowKey="id"
                    dataSource={filteredClients}
                    columns={columns}
                    expandable={{
                        expandedRowRender: (record) => (
                            <DocumentTable clientId={record.id} />
                        ),
                    }}
                    pagination={false}
                />
            )}

            {(showClientModal || selectedClientForEdit) && (
                <ClientCreateModal
                    onClose={() => {
                        setShowClientModal(false);
                        setSelectedClientForEdit(null);
                    }}
                    onSuccess={() => {
                        setShowClientModal(false);
                        setSelectedClientForEdit(null);
                        fetchClients();
                    }}
                    initialData={selectedClientForEdit}
                />
            )}

            {selectedClientForDoc && (
                <AddDocumentModal
                    clientId={selectedClientForDoc.id}
                    onCancel={() => setSelectedClientForDoc(null)}
                    onSuccess={() => {
                        setSelectedClientForDoc(null);
                        fetchClients();
                    }}
                />
            )}
        </>
    );
}

export default ClientDocument;
