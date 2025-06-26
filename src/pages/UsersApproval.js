import { Table, Button, message } from "antd";
import { useEffect, useState } from "react";
import { approveUser, getPendingUsers } from "../api";

function UsersApproval() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getPendingUsers().then((res) => setUsers(res.data));
    }, []);

    const approve = (id) => {
        approveUser(id).then(() => {
            message.success("کاربر تأیید شد");
            setUsers((prev) => prev.filter((u) => u.id !== id));
        });
    };

    const columns = [
        { title: "نام کاربری", dataIndex: "username" },
        { title: "نام کامل", dataIndex: "fullName" },
        {
            title: "عملیات",
            render: (_, user) => (
                <Button type="primary" onClick={() => approve(user.id)}>تأیید</Button>
            ),
        },
    ];

    return <Table rowKey="id" dataSource={users} columns={columns} />;
}

export default UsersApproval;
