import { Card, Table, Button, Modal, Input, message } from "antd";
import {EditOutlined, DeleteOutlined, RightOutlined, LeftOutlined} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
    getServices,
    createService,
    updateService,
    deleteService,
} from "../api/api";

function ServiceManager() {
    const [services, setServices] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState("");

    const loadServices = async () => {
        try {
            const res = await getServices();
            setServices(res.data);
        } catch {
            message.error("خطا در بارگذاری سرویس‌ها");
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const showModal = (record = null) => {
        setEditing(record);
        setName(record?.name || "");
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return message.warning("نام سرویس الزامی است");

        try {
            if (editing) {
                await updateService(editing.id, { name });
                message.success("سرویس ویرایش شد");
            } else {
                await createService({ name });
                message.success("سرویس جدید اضافه شد");
            }
            setModalOpen(false);
            setEditing(null);
            setName("");
            loadServices();
        } catch {
            message.error("خطا در ثبت سرویس");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteService(id);
            message.success("سرویس حذف شد");
            loadServices();
        } catch {
            message.error("خطا در حذف سرویس");
        }
    };

    const columns = [
        { title: "ردیف", render: (_, __, i) => i + 1 },
        { title: "نام سرویس", dataIndex: "name" },
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
                title="مدیریت سرویس‌ها"
                extra={
                    <Button type="dashed" onClick={() => showModal()}>
                        اضافه کردن sid
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={services}
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
            </Card>

            <Modal
                open={modalOpen}
                title={editing ? "ویرایش سرویس" : "افزودن سرویس جدید"}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText="ثبت"
                cancelText="انصراف"
            >
                <Input
                    placeholder="نام سرویس"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Modal>
        </>
    );
}

export default ServiceManager;
