import { useEffect, useState } from "react";
import {
    Table,
    Button,
    message,
    Input,
    Row,
    Col,
    Spin,
} from "antd";
import {
    getClients,
} from "../api/api";
import ClientCreateModal from "../components/ClientCreateModal";
import AddDocumentModal from "../components/AddDocumentModal";
import DocumentTable from "../components/DocumentTable";
import {
    UserAddOutlined,
    FileAddOutlined,
    SearchOutlined,
} from "@ant-design/icons";

function Documents() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClientForDoc, setSelectedClientForDoc] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchClients = () => {
        setLoading(true);
        getClients()
            .then((res) => setClients(res.data))
            .catch(() => {
                setClients([]);
                message.error("خطا در دریافت مشتری‌ها");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = clients.filter((client) => {
        const query = searchText.toLowerCase();

        const matchClient = Object.values(client).some(
            (val) => typeof val === "string" && val.toLowerCase().includes(query)
        );

        const matchDocuments = client.documents?.some((doc) => {
            const matchDocFields = Object.values(doc).some(
                (val) => typeof val === "string" && val.toLowerCase().includes(query)
            );

            const matchAttachments = doc.attachments?.some((att) =>
                Object.values(att).some(
                    (val) => typeof val === "string" && val.toLowerCase().includes(query)
                )
            );

            return matchDocFields || matchAttachments;
        });

        return matchClient || matchDocuments;
    });

    const columns = [
        {
            title: "سرویس",
            render: (_, record) => record.service?.name || "—",
        },
        {
            title: "نام مشتری",
            dataIndex: "name",
        },
        {
            title: "واحد",
            render: (_, record) => record.unit?.name || "—",
        },
        {
            title: "افزودن سند",
            render: (_, record) => (
                <Button
                    icon={<FileAddOutlined />}
                    onClick={() => setSelectedClientForDoc(record)}
                >
                    سند جدید
                </Button>
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
                        placeholder="جست‌وجو در مشتری‌ها و اسناد..."
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
                            <DocumentTable clientId={record.id} searchText={searchText} />
                        ),
                    }}
                    pagination={false}
                />
            )}

            {showClientModal && (
                <ClientCreateModal
                    onClose={() => setShowClientModal(false)}
                    onSuccess={() => {
                        setShowClientModal(false);
                        fetchClients();
                    }}
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

export default Documents;
