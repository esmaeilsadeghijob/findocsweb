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
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../api/api";
import "./Management.css";

function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [newCategory, setNewCategory] = useState({ name: "" });
    const [globalSearch, setGlobalSearch] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch {
            message.error("خطا در دریافت دسته‌بندی‌ها");
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
            await updateCategory(id, editedRow);
            message.success("ویرایش شد");
            setEditingKey(null);
            loadCategories();
        } catch {
            message.error("خطا در ویرایش دسته‌بندی");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            message.success("حذف شد");
            loadCategories();
        } catch {
            message.error("خطا در حذف دسته‌بندی");
        }
    };

    const handleCreate = async () => {
        if (!newCategory.name.trim()) return message.warning("نام دسته‌بندی الزامی است");

        try {
            await createCategory(newCategory);
            message.success("دسته‌بندی ثبت شد");
            setModalOpen(false);
            setNewCategory({ name: "" });
            loadCategories();
        } catch {
            message.error("خطا در افزودن دسته‌بندی");
        }
    };

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(globalSearch.toLowerCase())
    );

    const columns = [
        {
            title: "#",
            align: "center",
            width: 50,
            render: (_, __, index) => index + 1,
        },
        {
            title: "نام دسته‌بندی",
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
                            title="آیا از حذف این دسته‌بندی مطمئن هستید؟"
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
                        افزودن دسته‌بندی
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
                title="افزودن دسته‌بندی جدید"
                onCancel={() => setModalOpen(false)}
                onOk={handleCreate}
                okText="ثبت"
                cancelText="انصراف"
                className="add-company-modal"
            >
                <Space direction="vertical" className="add-company-form">
                    <Input
                        placeholder="دسته‌بندی یک، دو ..."
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ name: e.target.value })}
                    />
                </Space>
            </Modal>
        </>
    );
}

export default CategoryManager;
