import { useEffect, useState } from "react";
import {
    Button,
    Card,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Table,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import {
    getServices,
    createService,
    updateService,
    deleteService,
} from "../api/api";
import "./Management.css"; // ✅ استایل مشترک

function ServiceManager() {
    const [services, setServices] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [newService, setNewService] = useState({ name: "" });
    const [globalSearch, setGlobalSearch] = useState("");

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const res = await getServices();
            setServices(res.data);
        } catch {
            message.error("خطا در دریافت لیست سرویس‌ها");
        }
    };

    const isEditing = (record) => record.id === editingKey;

    const handleEdit = (record) => {
        setEditingKey(record.id);
        setEditedRow({ ...record });
    };

    const handleChange = (e) => {
        setEditedRow((prev) => ({ ...prev, name: e.target.value }));
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditedRow({});
    };

    const handleSave = async (id) => {
        try {
            await updateService(id, editedRow);
            message.success("ویرایش شد");
            setEditingKey(null);
            loadServices();
        } catch {
            message.error("خطا در ویرایش");
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

    const handleCreate = async () => {
        if (!newService.name.trim()) return message.warning("نام سرویس الزامی است");

        try {
            await createService(newService);
            message.success("سرویس با موفقیت ثبت شد");
            setModalOpen(false);
            setNewService({ name: "" });
            loadServices();
        } catch {
            message.error("خطا در ثبت سرویس");
        }
    };

    const filtered = services.filter((s) =>
        s.name.toLowerCase().includes(globalSearch.toLowerCase())
    );

    const columns = [
        {
            title: "#",
            align: "center",
            width: 50,
            render: (_, __, index) => index + 1,
        },
        {
            title: "نام سرویس",
            dataIndex: "name",
            render: (_, record) =>
                isEditing(record) ? (
                    <Input value={editedRow.name} onChange={handleChange} />
                ) : (
                    record.name
                ),
        },
        {
            title: "عملیات",
            key: "actions",
            align: "center",
            render: (_, record) =>
                isEditing(record) ? (
                    <Space>
                        <Button icon={<SaveOutlined />} onClick={() => handleSave(record.id)} />
                        <Button type="text" danger icon={<CloseOutlined />} onClick={handleCancel} />
                    </Space>
                ) : (
                    <Space>
                        <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                        <Popconfirm
                            title="آیا از حذف این سرویس مطمئن هستید؟"
                            onConfirm={() => handleDelete(record.id)}
                            okText="بله"
                            cancelText="خیر"
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                ),
        },
    ];

    return (
        <>
            <Card className="company-card" bodyStyle={{ padding: 0, flex: 1 }}>
                <div className="company-toolbar">
                    <Button
                        type="text"
                        icon={<PlusOutlined />}
                        className="add-company-btn"
                        onClick={() => setModalOpen(true)}
                    >
                        افزودن سرویس
                    </Button>

                    <Input
                        allowClear
                        placeholder="🔍 جستجو"
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="company-table-wrapper">
                    <Table
                        columns={columns}
                        dataSource={filtered}
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
                title="افزودن سرویس جدید"
                onCancel={() => setModalOpen(false)}
                onOk={handleCreate}
                okText="ثبت"
                cancelText="انصراف"
                className="add-company-modal"
            >
                <Space direction="vertical" className="add-company-form">
                    <Input
                        placeholder="نام سرویس"
                        value={newService.name}
                        onChange={(e) => setNewService({ name: e.target.value })}
                    />
                </Space>
            </Modal>
        </>
    );
}

export default ServiceManager;
