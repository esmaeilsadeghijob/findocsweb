import {useEffect, useState} from "react";
import {Button, message, Spin, Table} from "antd";
import {getClients} from "../api/api";
import DocumentTable from "../components/DocumentTable";
import ClientCreateModal from "../components/ClientCreateModal";
import AddDocumentModal from "./AddDocumentModal";
import {FileAddOutlined, UserAddOutlined} from "@ant-design/icons";

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showClientModal, setShowClientModal] = useState(false);
    const [selectedClientForDoc, setSelectedClientForDoc] = useState(null);

    const fetchClients = () => {
        setLoading(true);
        getClients()
            .then((res) => {
                setClients(res.data);
            })
            .catch(() => {
                setClients([]);
                message.error("خطا در دریافت مشتری‌ها");
            })
            .finally(() => setLoading(false));
    };

    const handleDelete = (id) => {
        deleteClient(id)
            .then(() => {
                message.success("مشتری حذف شد");
                fetchClients();
            })
            .catch(() => {
                message.error("حذف مشتری با خطا مواجه شد");
            });
    };

    const handleEdit = (record) => {
        // باز کردن مدال ویرایش
        // در اینجا برای ساده‌سازی، فقط پیام می‌زنیم. بعداً می‌تونیم ClientEditModal بسازیم.
        message.info(`در حال ویرایش: ${record.identifierCode}`);
    };

    useEffect(() => {
        fetchClients();
    }, []);

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
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                    <Button
                        icon={<FileAddOutlined />}
                        onClick={() => setSelectedClientForDoc(record)}
                    >
                        افزودن سند
                    </Button>
                </div>
            ),
        },
        {
            title: "عملیات",
            render: (_, record) => (
                <Button
                    icon={<FileAddOutlined />}
                    onClick={() => setSelectedClientForDoc(record)}
                >
                    افزودن سند
                </Button>
            ),
        },
    ];

    return (
        <>
            <div style={{ display: "flex", justifyContent: "end", marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setShowClientModal(true)}
                >
                    افزودن مشتری جدید
                </Button>
            </div>

            {loading ? (
                <Spin />
            ) : (
                <Table
                    rowKey="id"
                    dataSource={clients}
                    columns={columns}
                    expandable={{
                        expandedRowRender: (record) => (
                            <DocumentTable clientId={record.id} />
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
                    onSuccess={() => {
                        setSelectedClientForDoc(null);
                        fetchClients();
                    }}
                    onCancel={() => setSelectedClientForDoc(null)}
                />
            )}
        </>
    );
}

export default Clients;
