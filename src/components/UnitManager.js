import { useEffect, useState } from "react";
import {
    Button,
    Card,
    Input,
    message,
    Modal,
    Popconfirm,
    Table,
    Space,
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
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
} from "../api/api";
import "./Management.css"; //  استایل مشترک

function UnitManager() {
    const [units, setUnits] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [globalSearch, setGlobalSearch] = useState("");
    const [newUnit, setNewUnit] = useState({ name: "" });

    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        try {
            const res = await getUnits();
            setUnits(res.data);
        } catch {
            message.error("خطا در دریافت واحدها");
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

    const handleSave = async (id) => {
        try {
            await updateUnit(id, editedRow);
            message.success("ویرایش شد");
            setEditingKey(null);
            loadUnits();
        } catch {
            message.error("خطا در ویرایش");
        }
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditedRow({});
    };

    const handleDelete = async (id) => {
        try {
            await deleteUnit(id);
            message.success("حذف شد");
            loadUnits();
        } catch {
            message.error("خطا در حذف واحد");
        }
    };

    const handleCreate = async () => {
        if (!newUnit.name.trim()) return message.warning("نام واحد الزامی است");

        try {
            await createUnit(newUnit);
            message.success("واحد ثبت شد");
            setModalOpen(false);
            setNewUnit({ name: "" });
            loadUnits();
        } catch {
            message.error("خطا در افزودن واحد");
        }
    };

    const filtered = units.filter((u) =>
        u.name.toLowerCase().includes(globalSearch.toLowerCase())
    );

    const columns = [
        {
            title: "#",
            width: 50,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "نام واحد",
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
                            title="آیا از حذف این واحد مطمئن هستید؟"
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
                        افزودن واحد
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
                title="افزودن واحد جدید"
                onCancel={() => setModalOpen(false)}
                onOk={handleCreate}
                okText="ثبت"
                cancelText="انصراف"
                className="add-company-modal"
            >
                <Space direction="vertical" className="add-company-form">
                    <Input
                        placeholder="نام واحد"
                        value={newUnit.name}
                        onChange={(e) =>
                            setNewUnit((prev) => ({ ...prev, name: e.target.value }))
                        }
                    />
                </Space>
            </Modal>
        </>
    );
}

export default UnitManager;
