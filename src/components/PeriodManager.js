import {Button, Card, Input, message, Modal, Table} from "antd";
import {DeleteOutlined, EditOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {createPeriod, deletePeriod, getPeriods, updatePeriod,} from "../api/api";

function PeriodManager() {
    const [periods, setPeriods] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [fiscalYear, setFiscalYear] = useState("");

    const loadPeriods = async () => {
        try {
            const res = await getPeriods();
            setPeriods(res.data);
        } catch {
            message.error("خطا در بارگذاری دوره‌ها");
        }
    };

    useEffect(() => {
        loadPeriods();
    }, []);

    const showModal = (record = null) => {
        setEditing(record);
        setFiscalYear(record?.fiscalYear || "");
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!fiscalYear.trim()) return message.warning("سال مالی الزامی است");
        try {
            if (editing) {
                await updatePeriod(editing.id, { fiscalYear });
                message.success("دوره ویرایش شد");
            } else {
                await createPeriod({ fiscalYear });
                message.success("دوره جدید اضافه شد");
            }
            setModalOpen(false);
            setEditing(null);
            setFiscalYear("");
            loadPeriods();
        } catch {
            message.error("خطا در ثبت دوره");
        }
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

    const columns = [
        { title: "ردیف", render: (_, __, i) => i + 1 },
        { title: "سال مالی", dataIndex: "fiscalYear" },
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
                title="مدیریت دوره‌ها"
                extra={
                    <Button type="dashed" onClick={() => showModal()}>
                        اضافه کردن pid
                    </Button>
                }
                bodyStyle={{ padding: 0 }}
                style={{ maxHeight: 460, overflow: "hidden" }}
            >
                <div style={{height: "100%", overflowY: "auto"}}>
                    <Table
                        columns={columns}
                        dataSource={periods}
                        rowKey="id"
                        pagination={{
                            pageSize: 4,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            prevIcon: <RightOutlined/>,
                            nextIcon: <LeftOutlined/>,
                        }}
                        size="small"
                    />
                </div>
            </Card>

            <Modal
                open={modalOpen}
                title={editing ? "ویرایش دوره" : "افزودن دوره"}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText="ثبت"
                cancelText="انصراف"
            >
                <Input
                    placeholder="مثلاً 1402"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                />
            </Modal>
        </>
    );
}

export default PeriodManager;
