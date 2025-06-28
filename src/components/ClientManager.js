import { Card, Table, Button, Modal, Input, message } from "antd";
import { EditOutlined, DeleteOutlined , LeftOutlined, RightOutlined} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
    getClients,
    createClient,
    updateClient,
    deleteClient,
} from "../api/api";

function ClientManager() {
    const [clients, setClients] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState("");

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const res = await getClients();
            setClients(res.data);
        } catch {
            message.error("خطا در بارگذاری مشتری‌ها");
        }
    };

    const showModal = (record = null) => {
        setEditing(record);
        setName(record?.name || "");
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return message.warning("نام مشتری الزامی است");
        try {
            if (editing) {
                await updateClient(editing.id, { name });
                message.success("ویرایش انجام شد");
            } else {
                await createClient({ name });
                message.success("مشتری جدید اضافه شد");
            }
            setModalOpen(false);
            setEditing(null);
            setName("");
            loadClients();
        } catch {
            message.error("عملیات انجام نشد");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteClient(id);
            message.success("حذف شد");
            loadClients();
        } catch {
            message.error("خطا در حذف مشتری");
        }
    };

    const columns = [
        { title: "ردیف", render: (_, __, i) => i + 1 },
        { title: "نام مشتری", dataIndex: "name" },
        {
            title: "ویرایش",
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showModal(record)}
                />
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
            <Card
                title="مدیریت مشتری‌ها"
                extra={
                    <Button type="dashed" onClick={() => showModal()}>
                        اضافه کردن مشتری
                    </Button>
                }
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
                bodyStyle={{ padding: 0, flex: 1 }}
            >
                <div style={{ height: "100%", overflowY: "auto" }}>
                    <Table
                        columns={columns}
                        dataSource={clients}
                        rowKey="id"
                        pagination={{
                            pageSize: 4,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            prevIcon: <RightOutlined />, // برعکس
                            nextIcon: <LeftOutlined />,
                        }}
                        size="small"
                    />
                </div>
            </Card>

            <Modal
                open={modalOpen}
                title={editing ? "ویرایش مشتری" : "افزودن مشتری"}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText="ثبت"
                cancelText="انصراف"
            >
                <Input
                    placeholder="نام مشتری"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Modal>
        </>
    );
}

export default ClientManager;
