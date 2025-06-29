import { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message } from "antd";
import { getCompanies, deleteCompany } from "../api/api";
import AddCompanyForm from "./AddCompanyForm";

function CompanyManagement() {
    const [companies, setCompanies] = useState([]);

    const fetch = () => {
        getCompanies()
            .then((res) => setCompanies(res.data))
            .catch(() => message.error("خطا در دریافت لیست شرکت‌ها"));
    };

    useEffect(() => {
        fetch();
    }, []);

    const handleDelete = (id) => {
        deleteCompany(id)
            .then(() => {
                message.success("حذف شد");
                fetch();
            })
            .catch(() => message.error("خطا در حذف"));
    };

    const columns = [
        { title: "نام", dataIndex: "name" },
        { title: "شناسه ملی", dataIndex: "nationalId" },
        { title: "تلفن", dataIndex: "phone" },
        { title: "آدرس", dataIndex: "address" },
        {
            title: "عملیات",
            render: (_, record) => (
                <Popconfirm
                    title="آیا از حذف این مورد مطمئن هستید؟"
                    onConfirm={() => handleDelete(record.id)}
                    okText="بله"
                    cancelText="خیر"
                >
                    <Button danger>حذف</Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{ display: "flex", gap: 24 }}>
            <div style={{ width: 700, flexShrink: 0 }}>
                <AddCompanyForm onSuccess={fetch} />
            </div>

            <div style={{ flex: 1 }}>
                <Table
                    size="small"
                    rowKey="id"
                    columns={columns}
                    dataSource={companies}
                    pagination={false}
                />
            </div>
        </div>
    );
}

export default CompanyManagement;
