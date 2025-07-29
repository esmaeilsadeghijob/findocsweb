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
    getPeriods,
    createPeriod,
    updatePeriod,
    deletePeriod,
} from "../api/api";
import "./Management.css"; //  استایل مشترک

function PeriodManager() {
    const [periods, setPeriods] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState("");
    const [editingKey, setEditingKey] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [newPeriod, setNewPeriod] = useState({ fiscalYear: "" });

    useEffect(() => {
        loadPeriods();
    }, []);

    const loadPeriods = async () => {
        try {
            const res = await getPeriods();
            setPeriods(res.data);
        } catch {
            message.error("خطا در دریافت دوره‌ها");
        }
    };

    const isEditing = (record) => record.id === editingKey;

    const handleEdit = (record) => {
        setEditingKey(record.id);
        setEditedRow({ ...record });
    };

    const handleChange = (e) => {
        setEditedRow((prev) => ({ ...prev, fiscalYear: e.target.value }));
    };

    const handleSave = async (id) => {
        try {
            await updatePeriod(id, editedRow);
            message.success("ویرایش شد");
            setEditingKey(null);
            loadPeriods();
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
            await deletePeriod(id);
            message.success("دوره حذف شد");
            loadPeriods();
        } catch {
            message.error("خطا در حذف دوره");
        }
    };

    const handleCreate = async () => {
        if (!newPeriod.fiscalYear.trim()) return message.warning("سال مالی الزامی است");

        try {
            await createPeriod(newPeriod);
            message.success("دوره ثبت شد");
            setModalOpen(false);
            setNewPeriod({ fiscalYear: "" });
            loadPeriods();
        } catch {
            message.error("خطا در افزودن دوره");
        }
    };

    const filtered = periods.filter((p) =>
        p.fiscalYear.toLowerCase().includes(globalSearch.toLowerCase())
    );

    const columns = [
        {
            title: "#",
            align: "center",
            width: 50,
            render: (_, __, index) => index + 1,
        },
        {
            title: "سال مالی",
            dataIndex: "fiscalYear",
            render: (_, record) =>
                isEditing(record) ? (
                    <Input value={editedRow.fiscalYear} onChange={handleChange} />
                ) : (
                    record.fiscalYear
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
                            title="آیا از حذف این دوره مطمئن هستید؟"
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
                        افزودن دوره
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
                title="افزودن دوره جدید"
                onCancel={() => setModalOpen(false)}
                onOk={handleCreate}
                okText="ثبت"
                cancelText="انصراف"
                className="add-company-modal"
            >
                <Space direction="vertical" className="add-company-form">
                    <Input
                        placeholder="مثلاً 1402"
                        value={newPeriod.fiscalYear}
                        onChange={(e) =>
                            setNewPeriod((prev) => ({ ...prev, fiscalYear: e.target.value }))
                        }
                    />
                </Space>
            </Modal>
        </>
    );
}

export default PeriodManager;
