import { Card, Table, Button, Modal, Input, message } from "antd";
import {
    DeleteOutlined,
    LeftOutlined,
    RightOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
    getIdentifiers,
    createIdentifier,
    deleteIdentifier,
} from "../api/api";

function ClientManager() {
    const [identifiers, setIdentifiers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [code, setCode] = useState("");

    useEffect(() => {
        loadIdentifiers();
    }, []);

    const loadIdentifiers = async () => {
        try {
            const res = await getIdentifiers();
            setIdentifiers(res.data);
        } catch {
            message.error("خطا در بارگذاری شناسه‌ها");
        }
    };

    const showModal = () => {
        setCode("");
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!code.trim()) return message.warning("شناسه مشتری الزامی است");
        try {
            await createIdentifier({ code });
            message.success("شناسه جدید ثبت شد");
            setModalOpen(false);
            loadIdentifiers();
        } catch {
            message.error("عملیات انجام نشد");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteIdentifier(id);
            message.success("حذف شد");
            loadIdentifiers();
        } catch {
            message.error("خطا در حذف شناسه");
        }
    };

    const columns = [
        { title: "ردیف", render: (_, __, i) => i + 1 },
        { title: "شناسه مشتری", dataIndex: "code" },
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
                title="مدیریت شناسه‌های مشتری"
                extra={
                    <Button type="dashed" icon={<PlusOutlined />} onClick={showModal}>
                        افزودن شناسه
                    </Button>
                }
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
                bodyStyle={{ padding: 0, flex: 1 }}
            >
                <div style={{ height: "100%", overflowY: "auto" }}>
                    <Table
                        columns={columns}
                        dataSource={identifiers}
                        rowKey="id"
                        pagination={{
                            pageSize: 4,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            prevIcon: <RightOutlined />,
                            nextIcon: <LeftOutlined />,
                        }}
                        size="small"
                    />
                </div>
            </Card>

            <Modal
                open={modalOpen}
                title="افزودن شناسه مشتری"
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText="ثبت"
                cancelText="انصراف"
            >
                <Input
                    placeholder="شناسه مشتری"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            </Modal>
        </>
    );
}

export default ClientManager;
