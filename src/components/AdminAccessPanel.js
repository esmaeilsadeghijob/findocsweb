import React, {useEffect, useState} from "react";
import {Button, message, Select, Table} from "antd";
import {getPermissions, grantPermission, revokePermission} from "../api/api";

function AdminAccessPanel() {
    const [list, setList] = useState([]);
    const levels = ["NONE", "READ", "CREATE", "EDIT", "EXPORT", "ADMIN", "OWNER"];

    useEffect(() => {
        fetch();
    }, []);

    const fetch = () => getPermissions().then((res) => setList(res.data));

    const changeAccess = (userId, documentId, accessLevel) => {
        grantPermission({ userId, documentId, accessLevel }).then(() => {
            message.success("دسترسی بروزرسانی شد");
            fetch();
        });
    };

    const removeAccess = (userId, documentId) => {
        revokePermission({ userId, documentId }).then(() => {
            message.success("دسترسی حذف شد");
            fetch();
        });
    };

    return (
        <Table rowKey={(row) => row.userId + "_" + row.documentId} dataSource={list} columns={[
            { title: "کاربر", dataIndex: "userId" },
            { title: "شماره سند", dataIndex: "documentId" },
            { title: "سطح دسترسی", render: (_, r) =>
                    <Select value={r.accessLevel} onChange={v => changeAccess(r.userId, r.documentId, v)} options={levels.map(l => ({ label: l, value: l }))} />
            },
            { title: "حذف", render: (_, r) =>
                    <Button danger onClick={() => removeAccess(r.userId, r.documentId)}>حذف</Button>
            }
        ]} />
    );
}

export default AdminAccessPanel;
