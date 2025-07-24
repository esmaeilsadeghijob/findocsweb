import {useEffect, useState} from "react";
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
    DeleteOutlined,
    EditOutlined,
    LeftOutlined,
    RightOutlined,
    PlusOutlined,
    SaveOutlined, CloseOutlined,
} from "@ant-design/icons";
import {
    getCompanies,
    updateCompany,
    deleteCompany,
    createCompany,
} from "../api/api";
import "./Management.css";

function CompanyManager() {
    const [companies, setCompanies] = useState([]);
    const [editingKey, setEditingKey] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState("");
    const [newCompany, setNewCompany] = useState({
        name: "",
        identifierCode: "",
        nationalId: "",
        registrationNumber: "",
        phone: "",
        address: "",
    });

    const role = localStorage.getItem("role")?.trim();
    const accessLevel = localStorage.getItem("documentAccess")?.trim().toUpperCase();
    const canEdit =
        role === "ROLE_ADMIN" || (role === "ROLE_USER" && accessLevel === "OWNER");

    useEffect(() => {
        fetch();
    }, []);

    const fetch = () => {
        getCompanies()
            .then((res) => setCompanies(res.data))
            .catch(() => message.error("خطا در دریافت لیست شرکت‌ها"));
    };

    const isEditing = (record) => record.id === editingKey;

    const handleEdit = (record) => {
        setEditingKey(record.id);
        setEditedRow({...record});
    };

    const handleChange = (e, field) => {
        setEditedRow((prev) => ({...prev, [field]: e.target.value}));
    };

    const handleSave = async (id) => {
        try {
            await updateCompany(id, editedRow);
            message.success("ویرایش با موفقیت انجام شد");
            setEditingKey(null);
            fetch();
        } catch {
            message.error("خطا در ذخیره‌سازی تغییرات");
        }
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditedRow({});
    };

    const handleDelete = async (id) => {
        try {
            await deleteCompany(id);
            message.success("حذف شد");
            fetch();
        } catch {
            message.error("خطا در حذف");
        }
    };

    const handleSubmitNewCompany = async () => {
        if (!newCompany.name.trim()) return message.warning("نام شرکت الزامی است");

        try {
            await createCompany(newCompany);
            message.success("شرکت با موفقیت ثبت شد");
            setModalOpen(false);
            setNewCompany({
                name: "",
                identifierCode: "",
                nationalId: "",
                registrationNumber: "",
                phone: "",
                address: "",
            });
            fetch();
        } catch {
            message.error("خطا در ثبت شرکت");
        }
    };

    const filteredCompanies = companies.filter((c) =>
        Object.values(c).some((val) =>
            (val || "").toString().toLowerCase().includes(globalSearch.toLowerCase())
        )
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
            title: "نام",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (_, record) =>
                isEditing(record) ? (
                    <Input value={editedRow.name} onChange={(e) => handleChange(e, "name")}/>
                ) : (
                    record.name
                ),
        },
        {
            title: "شماره شناسایی",
            dataIndex: "identifierCode",
            sorter: (a, b) => a.identifierCode.localeCompare(b.identifierCode),
            render: (_, record) =>
                isEditing(record) ? (
                    <Input value={editedRow.identifierCode} onChange={(e) => handleChange(e, "identifierCode")}/>
                ) : (
                    record.identifierCode
                ),
        },
        {
            title: "شناسه ملی",
            dataIndex: "nationalId",
            sorter: (a, b) => a.nationalId.localeCompare(b.nationalId),
            render: (_, record) =>
                isEditing(record) ? (
                    <Input value={editedRow.nationalId} onChange={(e) => handleChange(e, "nationalId")}/>
                ) : (
                    record.nationalId
                ),
        },
        {
            title: "شماره ثبت",
            dataIndex: "registrationNumber",
            sorter: (a, b) => a.registrationNumber.localeCompare(b.registrationNumber),
            render: (_, record) =>
                isEditing(record) ? (
                    <Input value={editedRow.registrationNumber}
                           onChange={(e) => handleChange(e, "registrationNumber")}/>
                ) : (
                    record.registrationNumber
                ),
        },
        {
            title: "تلفن",
            dataIndex: "phone",
            sorter: (a, b) => a.phone.localeCompare(b.phone),
            render: (_, record) =>
                isEditing(record) ? (
                    <Input value={editedRow.phone} onChange={(e) => handleChange(e, "phone")}/>
                ) : (
                    record.phone
                ),
        },
        {
            title: "آدرس",
            dataIndex: "address",
            sorter: (a, b) => a.address.localeCompare(b.address),
            render: (_, record) =>
                isEditing(record) ? (
                    <Input value={editedRow.address} onChange={(e) => handleChange(e, "address")}/>
                ) : (
                    record.address
                ),
        },
        ...(canEdit
            ? [
                {
                    title: "عملیات",
                    key: "actions",
                    width: 120,
                    render: (_, record) => (
                        <div style={{textAlign: "center"}}>
                            {isEditing(record) ? (
                                <Space>
                                    <Button icon={<SaveOutlined/>} onClick={() => handleSave(record.id)}/>
                                    <Button type="text" danger icon={<CloseOutlined/>} onClick={handleCancel}/>
                                </Space>
                            ) : (
                                <Space>
                                    <Button icon={<EditOutlined/>} onClick={() => handleEdit(record)}/>
                                    <Popconfirm
                                        title="آیا از حذف این مورد مطمئن هستید؟"
                                        onConfirm={() => handleDelete(record.id)}
                                        okText="بله"
                                        cancelText="خیر"
                                    >
                                        <Button danger icon={<DeleteOutlined/>}/>
                                    </Popconfirm>
                                </Space>
                            )}
                        </div>
                    ),
                },
            ]
            : []),
    ];

    return (
        <>
            <Card className="company-card" bodyStyle={{padding: 0, flex: 1}}
            >
                <div className="company-toolbar">
                    <Button
                        type="text"
                        icon={<PlusOutlined/>}
                        className="add-company-btn"
                        onClick={() => setModalOpen(true)}
                    >
                        افزودن شرکت / اشخاص
                    </Button>

                    <Input
                        allowClear
                        placeholder="🔍 جستجو"
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        style={{maxWidth: 340}}
                    />
                </div>

                <div style={{flex: 1, overflowY: "auto"}}>
                    <Table
                        columns={columns}
                        dataSource={filteredCompanies}
                        rowKey="id"
                        pagination={{
                            pageSize: 4,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            prevIcon: <RightOutlined/>,
                            nextIcon: <LeftOutlined/>,
                        }}
                        size="small"
                            locale={{
                                triggerDesc: "کلیک برای مرتب‌سازی نزولی",
                                triggerAsc: "کلیک برای مرتب‌سازی صعودی",
                                cancelSort: "کلیک برای لغو مرتب‌سازی",
                            }}
                    />
                </div>
            </Card>

            <Modal
                open={modalOpen}
                title="افزودن شرکت / شخص"
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmitNewCompany}
                okText="ثبت"
                cancelText="انصراف"
            >
                <Space direction="vertical" style={{width: "100%"}}>
                    <Input
                        placeholder="نام شرکت / شخص"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany((prev) => ({...prev, name: e.target.value}))}
                    />
                    <Input
                        placeholder="شماره شناسایی"
                        value={newCompany.identifierCode}
                        onChange={(e) => setNewCompany((prev) => ({...prev, identifierCode: e.target.value}))}
                    />
                    <Input
                        placeholder="شناسه ملی / شماره ملی"
                        value={newCompany.nationalId}
                        onChange={(e) => setNewCompany((prev) => ({...prev, nationalId: e.target.value}))}
                    />
                    <Input
                        placeholder="شماره ثبت"
                        value={newCompany.registrationNumber}
                        onChange={(e) => setNewCompany((prev) => ({...prev, registrationNumber: e.target.value}))}
                    />
                    <Input
                        placeholder="تلفن"
                        value={newCompany.phone}
                        onChange={(e) =>
                            setNewCompany((prev) => ({
                                ...prev,
                                phone: e.target.value,
                            }))
                        }
                    />
                    <Input.TextArea
                        rows={2}
                        placeholder="آدرس"
                        value={newCompany.address}
                        onChange={(e) =>
                            setNewCompany((prev) => ({
                                ...prev,
                                address: e.target.value,
                            }))
                        }
                    />
                </Space>
            </Modal>
        </>
    );
}

export default CompanyManager;
