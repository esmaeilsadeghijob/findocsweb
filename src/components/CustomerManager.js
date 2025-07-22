import {useEffect, useState} from "react";
import {
    Button,
    Card,
    Input,
    Table,
    Space,
    Modal,
    message,
    Form,
    Select,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    LockOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";
import {
    getClients,
    createClient,
    updateClient,
    deleteClient,
    getUnits,
    getServices,
    getIdentifiers, verifyPassword,
} from "../api/api";
import "./Management.css";

function CustomerManager() {
    const [clients, setClients] = useState([]);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [globalSearch, setGlobalSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [units, setUnits] = useState([]);
    const [services, setServices] = useState([]);
    const [identifiers, setIdentifiers] = useState([]);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchClients();
        fetchMeta();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await getClients();
            setClients(res.data);
        } catch {
            message.error("خطا در دریافت مشتری‌ها");
        } finally {
            setLoading(false);
        }
    };

    const fetchMeta = async () => {
        try {
            const resUnits = await getUnits();
            const resServices = await getServices();
            const resIds = await getIdentifiers();
            setUnits(resUnits.data);
            setServices(resServices.data);
            setIdentifiers(resIds.data);
        } catch {
            message.error("خطا در دریافت داده‌های پایه");
        }
    };

    const filtered = clients.filter((c) =>
        [c.unitName, c.serviceName, c.identifierCode]
            .join(" ")
            .toLowerCase()
            .includes(globalSearch.toLowerCase())
    );

    const handleEdit = (record) => {
        setEditingClient(record);
        form.setFieldsValue({
            identifierCode: record.identifierCode,
            unitId: record.unitId,
            serviceId: record.serviceId,
        });
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingClient(null);
        form.resetFields();
        setModalOpen(true);
    };


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingClient) {
                await updateClient(editingClient.id, values);
                message.success("ویرایش انجام شد");
            } else {
                await createClient(values);
                message.success("مشتری جدید ثبت شد");
            }
            setModalOpen(false);
            setEditingClient(null);
            form.resetFields();
            fetchClients();
        } catch {
            message.error("خطا در ذخیره اطلاعات");
        }
    };

    const handleDeleteRequest = (client) => {
        Modal.confirm({
            title: "حذف مشتری",
            content: `آیا مطمئن هستید که می‌خواهید "${client.unitName}" را حذف کنید؟`,
            okText: "حذف",
            cancelText: "انصراف",
            onOk: () => confirmDeleteClient(client),
        });
    };


    const confirmDeleteClient = async (client) => {
        try {
            await deleteClient(client.id);
            message.success("مشتری حذف شد");
            fetchClients();
        } catch {
            message.error("❌ خطا در حذف مشتری");
        }
    };

    const columns = [
        {
            title: "#",
            align: "center",
            width: 50,
            render: (_, __, index) => index + 1,
        },
        {
            title: "شناسه",
            dataIndex: "identifierCode",
        },
        {
            title: "واحد",
            dataIndex: "unitName",
        },
        {
            title: "سرویس",
            dataIndex: "serviceName",
        },
        {
            title: "عملیات",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined/>} onClick={() => handleEdit(record)}/>
                    <Button
                        danger
                        icon={<DeleteOutlined/>}
                        onClick={() => handleDeleteRequest(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card className="company-card" bodyStyle={{padding: 0}}>
                <div className="company-toolbar">
                    <Button
                        type="text"
                        icon={<PlusOutlined/>}
                        className="add-company-btn"
                        onClick={handleAdd}
                    >
                        افزودن مشتری
                    </Button>

                    <Input
                        allowClear
                        prefix={<SearchOutlined/>}
                        placeholder="🔍 جستجو مشتری"
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
                            prevIcon: <RightOutlined/>,
                            nextIcon: <LeftOutlined/>,
                        }}
                        size="small"
                    />
                </div>
            </Card>

            {/* مودال ثبت / ویرایش */}
            <Modal
                open={modalOpen}
                title={editingClient ? "ویرایش مشتری" : "افزودن مشتری جدید"}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingClient(null);
                    form.resetFields();
                }}
                onOk={handleSubmit}
                okText={editingClient ? "ذخیره" : "ثبت"}
                cancelText="انصراف"
                className="add-company-modal"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="identifierCode"
                        label="شناسه"
                        rules={[{required: true, message: "شناسه الزامی است"}]}
                    >
                        <Select
                            showSearch
                            options={identifiers.map((i) => ({
                                label: i.code,
                                value: i.code,
                            }))}
                            placeholder="انتخاب شناسه تخصیص‌یافته"
                        />
                    </Form.Item>

                    <Form.Item
                        name="unitId"
                        label="واحد"
                        rules={[{required: true, message: "واحد الزامی است"}]}
                    >
                        <Select
                            showSearch
                            options={units.map((u) => ({
                                label: u.name,
                                value: u.id,
                            }))}
                            placeholder="انتخاب واحد"
                        />
                    </Form.Item>

                    <Form.Item
                        name="serviceId"
                        label="سرویس"
                        rules={[{required: true, message: "سرویس الزامی است"}]}
                    >
                        <Select
                            showSearch
                            options={services.map((s) => ({
                                label: s.name,
                                value: s.id,
                            }))}
                            placeholder="انتخاب سرویس"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* مدال رمز برای حذف نهایی */}
            <Modal
                open={deleteModalOpen}
                title={`تأیید حذف مشتری "${deleteTarget?.unitName}"`}
                onCancel={() => setDeleteModalOpen(false)}
                onOk={confirmDeleteClient}
                okText="حذف نهایی"
                cancelText="انصراف"
                className="add-company-modal"
            >
                <Space direction="vertical" style={{width: "100%"}}>
                    <Input.Password
                        placeholder="رمز عبور مدیر"
                        prefix={<LockOutlined/>}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}/>
                </Space>
            </Modal>
        </>
    );
}

export default CustomerManager;