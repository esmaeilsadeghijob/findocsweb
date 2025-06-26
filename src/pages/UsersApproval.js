import { useEffect, useState } from "react";
import {
    Table,
    Button,
    Space,
    Popconfirm,
    message,
    Tag,
    Typography,
} from "antd";
import {
    approveUser,
    getPendingUsers,
    getUsers,
    deleteUser,
} from "../api/api";

const { Title } = Typography;

function UsersApproval() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const fetchData = () => {
        getPendingUsers()
            .then((res) => setPendingUsers(res.data))
            .catch(() => setPendingUsers([]));

        getUsers()
            .then((res) => setAllUsers(res.data))
            .catch(() => setAllUsers([]));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await approveUser(id);
            message.success("کاربر تأیید شد");
            fetchData();
        } catch {
            message.error("تأیید ناموفق بود");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            message.success("کاربر حذف شد");
            fetchData();
        } catch {
            message.error("خطا در حذف کاربر");
        }
    };

    const pendingColumns = [
        { title: "نام کاربری", dataIndex: "username" },
        { title: "نام", dataIndex: "firstName" },
        { title: "نام خانوادگی", dataIndex: "lastName" },
        {
            title: "نقش",
            render: (_, record) => (
                <Tag color="blue">{record.role?.name || "نامشخص"}</Tag>
            ),
        },
        {
            title: "عملیات",
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApprove(record.id)}
                >
                    تأیید
                </Button>
            ),
        },
    ];

    const allColumns = [
        { title: "نام کاربری", dataIndex: "username" },
        { title: "نام", dataIndex: "firstName" },
        { title: "نام خانوادگی", dataIndex: "lastName" },
        {
            title: "نقش",
            render: (_, record) => (
                <Tag color="green">{record.role?.name || "نامشخص"}</Tag>
            ),
        },
        {
            title: "عملیات",
            render: (_, record) => (
                <Space>
                    <Button size="small" disabled>
                        ویرایش
                    </Button>
                    <Popconfirm
                        title="آیا از حذف مطمئن هستید؟"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger size="small">حذف</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Title level={4}>کاربران تازه وارد (در انتظار تأیید)</Title>
            <Table
                rowKey="id"
                dataSource={pendingUsers}
                columns={pendingColumns}
                pagination={false}
                size="small"
                style={{ marginBottom: "2rem" }}
            />

            <Title level={4}>همه کاربران سیستم</Title>
            <Table
                rowKey="id"
                dataSource={allUsers}
                columns={allColumns}
                pagination={false}
                size="small"
            />
        </>
    );
}

export default UsersApproval;
