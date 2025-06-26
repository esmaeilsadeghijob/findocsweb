import { Card, Table, Button, Modal, Input, message } from "antd";
import {EditOutlined, DeleteOutlined, RightOutlined, LeftOutlined} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
} from "../api/api";

function UnitManager() {
    const [units, setUnits] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState("");

    const loadUnits = async () => {
        try {
            const res = await getUnits();
            setUnits(res.data);
        } catch (err) {
            message.error("خطا در بارگذاری واحدها");
        }
    };

    useEffect(() => {
        loadUnits();
    }, []);

    const showModal = (record = null) => {
        setEditing(record);
        setName(record?.name || "");
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return message.warning("نام واحد خالی است");

        try {
            if (editing) {
                await updateUnit(editing.id, { name });
                message.success("واحد ویرایش شد");
            } else {
                await createUnit({ name });
                message.success("واحد اضافه شد");
            }

            setModalOpen(false);
            setEditing(null);
            setName("");
            loadUnits();
        } catch (err) {
            message.error("خطا در ثبت واحد");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteUnit(id);
            message.success("واحد حذف شد");
            loadUnits();
        } catch {
            message.error("خطا در حذف واحد");
        }
    };

    const columns = [
        { title: "ردیف", render: (_, __, i) => i + 1 },
        { title: "نام واحد", dataIndex: "name" },
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
                title="مدیریت واحدها"
                extra={
                    <Button type="dashed" onClick={() => showModal()}>
                        اضافه کردن uid
                    </Button>
                }
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
                bodyStyle={{ padding: 0, flex: 1 }}
            >
                <div style={{ height: "100%", overflowY: "auto" }}>
                    <Table
                        columns={columns}
                        dataSource={units}
                        rowKey="id"
                        pagination={{
                            pageSize: 6,
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
                title={editing ? "ویرایش واحد" : "افزودن واحد"}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText="ثبت"
                cancelText="انصراف"
            >
                <Input
                    placeholder="نام واحد"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Modal>
        </>
    );
}

export default UnitManager;
