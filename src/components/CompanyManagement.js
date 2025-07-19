import {useEffect, useState} from "react";
import {Button, Card, Input, message, Popconfirm, Space, Table,} from "antd";
import {DeleteOutlined, EditOutlined, LeftOutlined, RightOutlined, SaveOutlined,} from "@ant-design/icons";
import {deleteCompany, getCompanies, updateCompany,} from "../api/api";
import AddCompanyForm from "./AddCompanyForm";

function CompanyManagement() {
    const [companies, setCompanies] = useState([]);
    const [editingKey, setEditingKey] = useState(null);
    const [editedRow, setEditedRow] = useState({});

    const fetch = () => {
        getCompanies()
            .then((res) => setCompanies(res.data))
            .catch(() => message.error("خطا در دریافت لیست شرکت‌ها"));
    };

    useEffect(() => {
        fetch();
    }, []);

    const isEditing = (record) => record.id === editingKey;

    const handleEdit = (record) => {
        setEditingKey(record.id);
        setEditedRow({ ...record });
    };

    const handleChange = (e, field) => {
        setEditedRow((prev) => ({ ...prev, [field]: e.target.value }));
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

    const handleDelete = (id) => {
        deleteCompany(id)
            .then(() => {
                message.success("حذف شد");
                fetch();
            })
            .catch(() => message.error("خطا در حذف"));
    };

    const columns = [
        {
            title: "نام",
            dataIndex: "name",
            render: (_, record) =>
                isEditing(record) ? (
                    <Input
                        value={editedRow.name}
                        onChange={(e) => handleChange(e, "name")}
                    />
                ) : (
                    record.name
                ),
        },
        {
            title: "شماره شناسایی",
            dataIndex: "identifierCode",
            render: (_, record) =>
                isEditing(record) ? (
                    <Input
                        value={editedRow.identifierCode}
                        onChange={(e) => handleChange(e, "identifierCode")}
                    />
                ) : (
                    record.identifierCode
                ),
        },
        {
            title: "شناسه ملی",
            dataIndex: "nationalId",
            render: (_, record) =>
                isEditing(record) ? (
                    <Input
                        value={editedRow.nationalId}
                        onChange={(e) => handleChange(e, "nationalId")}
                    />
                ) : (
                    record.nationalId
                ),
        },
        {
            title: "شماره ثبت",
            dataIndex: "registrationNumber",
            render: (_, record) =>
                isEditing(record) ? (
                    <Input
                        value={editedRow.registrationNumber}
                        onChange={(e) => handleChange(e, "registrationNumber")}
                    />
                ) : (
                    record.registrationNumber
                ),
        },
        {
            title: "تلفن",
            dataIndex: "phone",
            render: (_, record) =>
                isEditing(record) ? (
                    <Input
                        value={editedRow.phone}
                        onChange={(e) => handleChange(e, "phone")}
                    />
                ) : (
                    record.phone
                ),
        },
        {
            title: "آدرس",
            dataIndex: "address",
            render: (_, record) =>
                isEditing(record) ? (
                    <Input
                        value={editedRow.address}
                        onChange={(e) => handleChange(e, "address")}
                    />
                ) : (
                    record.address
                ),
        },
        {
            title: "عملیات",
            render: (_, record) =>
                isEditing(record) ? (
                    <Space>
                        <Button
                            type="link"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave(record.id)}
                            title="ذخیره"
                        />
                        <Button type="text" danger onClick={handleCancel}>
                            لغو
                        </Button>
                    </Space>
                ) : (
                    <Space>
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            title="ویرایش"
                        />
                        <Popconfirm
                            title="آیا از حذف این مورد مطمئن هستید؟"
                            onConfirm={() => handleDelete(record.id)}
                            okText="بله"
                            cancelText="خیر"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                title="حذف"
                            />
                        </Popconfirm>
                    </Space>
                ),
        },
    ];

    return (
        <div style={{ display: "flex", alignItems: "start", gap: 32 }}>
            {/* فرم افزودن شرکت */}
            <div style={{ flex: "0 0 460px" }}>
                <AddCompanyForm onSuccess={fetch} />
            </div>

            {/* جدول شرکت‌ها */}
            <div style={{ flex: 1 }}>
                <Card title="لیست شرکت‌ها">
                    <Table
                        size="small"
                        rowKey="id"
                        columns={columns}
                        dataSource={companies}
                        pagination={{
                            pageSize: 15,
                            position: ["bottomCenter"],
                            showSizeChanger: false,
                            prevIcon: <RightOutlined />,
                            nextIcon: <LeftOutlined />,
                        }}
                    />
                </Card>
            </div>
        </div>
    );
}

export default CompanyManagement;
