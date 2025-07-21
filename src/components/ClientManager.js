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
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import {
    getIdentifiers,
    createIdentifier,
    deleteIdentifier,
    updateIdentifier,
} from "../api/api";
import "./Management.css";

function ClientManager() {
    const [identifiers, setIdentifiers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [code, setCode] = useState("");
    const [globalSearch, setGlobalSearch] = useState("");
    const [editingKey, setEditingKey] = useState(null);
    const [editedRow, setEditedRow] = useState({});

    useEffect(() => {
        loadIdentifiers();
    }, []);

    const loadIdentifiers = async () => {
        try {
            const res = await getIdentifiers();
            setIdentifiers(res.data);
        } catch {
            message.error("خطا در دریافت شناسه‌ها");
        }
    };

    const handleSubmit = async () => {
        if (!code.trim()) return message.warning("شناسه مشتری الزامی است");

        try {
            await createIdentifier({ code });
            message.success("ثبت شد");
            setModalOpen(false);
            setCode("");
            loadIdentifiers();
        } catch {
            message.error("خطا در ثبت شناسه");
        }
    };

    const handleEdit = (record) => {
        setEditingKey(record.id);
        setEditedRow({ ...record });
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditedRow({});
    };

    const handleChange = (e) => {
        setEditedRow((prev) => ({ ...prev, code: e.target.value }));
    };

    const handleSave = async (id) => {
        try {
            await updateIdentifier(id, editedRow);
            message.success("ویرایش شد");
            setEditingKey(null);
            loadIdentifiers();
        } catch {
            message.error("خطا در ویرایش شناسه");
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

    const filtered = identifiers.filter((i) =>
        i.code.toLowerCase().includes(globalSearch.toLowerCase())
    );

    const columns = [
        {
            title: "#",
            dataIndex: "rowIndex",
            width: 50,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "شناسه مشتری",
            dataIndex: "code",
            render: (_, record) =>
                editingKey === record.id ? (
                    <Input value={editedRow.code} onChange={handleChange} />
                ) : (
                    record.code
                ),
        },
        {
            title: "عملیات",
            key: "actions",
            align: "center",
            render: (_, record) =>
                editingKey === record.id ? (
                    <Space>
                        <Button icon={<SaveOutlined />} onClick={() => handleSave(record.id)} />
                        <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={handleCancel}
                        />
                    </Space>
                ) : (
                    <Space>
                        <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                        <Popconfirm
                            title="آیا از حذف این شناسه مطمئن هستید؟"
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
                        افزودن شناسه مشتری
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
                title="افزودن شناسه مشتری"
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText="ثبت"
                cancelText="انصراف"
                className="add-company-modal"
            >
                <Space direction="vertical" className="add-company-form">
                    <Input
                        placeholder="شناسه مشتری"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </Space>
            </Modal>
        </>
    );
}

export default ClientManager;
