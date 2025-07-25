import { useEffect, useState } from "react";
import {
    Button,
    Input,
    message,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import {
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
} from "@ant-design/icons";
import {
    approveUser,
    deleteUser,
    getPendingUsers,
    getUsers,
    updateDefaultAccess,
    updateUser,
    getClients, getIdentifiers,
} from "../api/api";

const { Title } = Typography;

const accessOptions = [
    { label: "عدم دسترسی", value: "NONE" },
    { label: "گزارش‌گیری", value: "READ" },
    { label: "ورود اطلاعات", value: "CREATE" },
    { label: "ویرایش / حذف", value: "EDIT" },
    { label: "دانلود", value: "DOWNLOAD" },
    { label: "برگشت از وضعیت قطعی", value: "REVERT" },
    { label: "مدیریتی", value: "ADMIN" },
    { label: "مدیر اصلی", value: "OWNER" },
];

function UsersApproval() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [units, setUnits] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [identifiers, setIdentifiers] = useState([]);

    const fetchData = () => {
        getPendingUsers()
            .then((res) => setPendingUsers(res.data))
            .catch(() => setPendingUsers([]));

        getUsers()
            .then((res) => {
                const normalized = res.data.map((u) => {
                    const [firstName, ...rest] = (u.fullName || "").split(" ");
                    const lastName = rest.join(" ");

                    return {
                        ...u,
                        firstName,
                        lastName,
                        units: u.units || [], // ✅ واحدها برای تگ‌گذاری
                        unitIds: u.units?.map((unit) => unit.id) || [],
                        defaultAccess:
                            u.role?.name === "ROLE_ADMIN"
                                ? "OWNER"
                                : u.defaultAccessLevel ?? "NONE",
                    };
                });
                setAllUsers(normalized);
            })
            .catch(() => setAllUsers([]));
    };

    useEffect(() => {
        fetchData();
        getClients().then((res) => {
            const extractedUnits = res.data.map((c) => ({
                id: c.unitId,
                unitName: c.unitName,
            })).filter((u) => u.id && u.unitName);
            setUnits(extractedUnits);
        });

        getIdentifiers()
            .then((res) => setIdentifiers(res.data || []))
            .catch(() => setIdentifiers([]));
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

    const handleAccessChange = async (id, level) => {
        try {
            await updateDefaultAccess(id, level);
            message.success("سطح دسترسی بروزرسانی شد");
            setAllUsers((prev) =>
                prev.map((u) =>
                    u.id === id ? { ...u, defaultAccess: level } : u
                )
            );
        } catch {
            message.error("خطا در بروزرسانی سطح دسترسی");
        }
    };

    const handleUnitAssignment = async (userId, unitIds) => {
        try {
            await updateUser(userId, { unitIds });
            message.success("واحدها بروزرسانی شدند");
            fetchData(); // ✅ رفرش کامل برای داشتن داده درست
        } catch {
            message.error("خطا در بروزرسانی واحدها");
        }
    };

    const handleUnitIdentifierId = async (userId, identifierId) => {
        try {
            await updateUser(userId, { identifierId });
            message.success("شرکت بروزرسانی شدند");
            fetchData(); // ✅ رفرش کامل برای داشتن داده درست
        } catch {
            message.error("خطا در بروزرسانی شرکت");
        }
    };

    const startEdit = (user) => {
        setEditingUserId(user.id);
        setEditValues({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            newPassword: "",
        });
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditValues({});
    };

    const saveEdit = async (id) => {
        try {
            await updateUser(id, editValues);
            message.success("ویرایش انجام شد");

            const currentUsername = localStorage.getItem("username");
            if (editValues.username === currentUsername) {
                const displayName =
                    editValues.firstName?.trim() ||
                    `${editValues.firstName?.trim() ?? ""} ${editValues.lastName?.trim() ?? ""}`.trim() ||
                    editValues.username;
                localStorage.setItem("displayName", displayName);
            }

            fetchData();
            cancelEdit();
        } catch {
            message.error("خطا در ویرایش کاربر");
        }
    };

    const pendingColumns = [
        { title: "ردیف", render: (_, __, index) => <Tag>{index + 1}</Tag> },
        { title: "نام کاربری", dataIndex: "username" },
        { title: "نام", dataIndex: "firstName" },
        { title: "نام خانوادگی", dataIndex: "lastName" },
        {
            title: "نقش",
            render: (_, r) => <Tag color="blue">{r.role?.name || "نامشخص"}</Tag>,
        },
        {
            title: "عملیات",
            render: (_, r) => (
                <Button type="primary" size="small" onClick={() => handleApprove(r.id)}>
                    تأیید
                </Button>
            ),
        },
    ];

    const allColumns = [
        { title: "ردیف", render: (_, __, index) => <Tag>{index + 1}</Tag> },
        {
            title: "نام کاربری",
            render: (_, r) =>
                r.id === editingUserId ? (
                    <Input
                        value={editValues.username}
                        onChange={(e) => setEditValues((prev) => ({
                            ...prev,
                            username: e.target.value,
                        }))}
                    />
                ) : (
                    r.username
                ),
        },
        {
            title: "نام",
            render: (_, r) =>
                r.id === editingUserId ? (
                    <Input
                        value={editValues.firstName}
                        onChange={(e) => setEditValues((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                        }))}
                    />
                ) : (
                    r.firstName
                ),
        },
        {
            title: "نام خانوادگی",
            render: (_, r) =>
                r.id === editingUserId ? (
                    <Input
                        value={editValues.lastName}
                        onChange={(e) => setEditValues((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                        }))}
                    />
                ) : (
                    r.lastName
                ),
        },
        {
            title: "تغییر گذرواژه",
            render: (_, r) =>
                r.id === editingUserId ? (
                    <Input.Password
                        value={editValues.newPassword}
                        onChange={(e) => setEditValues((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                        }))}
                    />
                ) : (
                    "-"
                ),
        },
        {
            title: "نقش",
            render: (_, r) => <Tag color="green">{r.role?.name || "نامشخص"}</Tag>,
        },
        {
            title: "شرکت",
            render: (_, r) =>
                r.role?.name === "ROLE_ADMIN" ? (
                    <span style={{ color: "#999" }}>—</span>
                ) : (
                    <Select
                        placeholder="انتخاب شرکت"
                        disabled={identifiers.length === 0}
                        value={r.identifierId || identifiers[0]?.id || null}
                        onChange={(selectedId) => {
                            handleUnitIdentifierId(r.id, selectedId);
                        }}
                        options={identifiers.map((id) => ({
                            label: id.code || "شناسه نامشخص",
                            value: id.id
                        }))}
                        style={{ width: "100%" }}
                        dropdownStyle={{ fontSize: "0.9rem", backgroundColor: "#fffefc" }}
                    />
                )
        },
        {
            title: "واحدهای مرتبط",
            render: (_, r) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(r.units || []).map((unit) => (
                        <Tag
                            key={unit.id}
                            color="blue"
                            closable={r.role?.name !== "ROLE_ADMIN"}
                            onClose={() => {
                                const updatedIds = r.unitIds.filter((id) => id !== unit.id);
                                handleUnitAssignment(r.id, updatedIds);
                            }}
                            style={{ fontSize: "0.75rem", padding: "2px 6px" }}
                        >
                            {unit.name || "نامشخص"}
                        </Tag>
                    ))}
                </div>
            ),
        },
        {
            title: "افزودن واحد",
            render: (_, r) => {
                const availableUnits = units.filter((unit) => !(r.unitIds || []).includes(unit.id));

                return (
                    <Select
                        showSearch
                        placeholder="افزودن واحد جدید"
                        disabled={r.role?.name === "ROLE_ADMIN" || availableUnits.length === 0}
                        style={{ width: "100%" }}
                        value={undefined}
                        onSelect={(selectedId) => {
                            const updated = [...(r.unitIds || []), selectedId];
                            handleUnitAssignment(r.id, Array.from(new Set(updated)));
                        }}
                        options={availableUnits.map((unit) => ({
                            label: unit.unitName || "نام واحد نامشخص",
                            value: unit.id,
                        }))}
                        notFoundContent="واحدی برای افزودن باقی نمانده"
                    />
                );
            }
        },
        {
            title: "سطح دسترسی",
            render: (_, r) => (
                <Select
                    style={{
                        width: "100%",
                        fontSize: "0.9rem",
                        borderRadius: 6,
                        backgroundColor: "#fcfcfc",
                    }}
                    placeholder="سطح دسترسی"
                    value={r.role?.name === "ROLE_ADMIN" ? "OWNER" : r.defaultAccess}
                    onChange={(val) => handleAccessChange(r.id, val)}
                    options={accessOptions}
                    disabled={r.role?.name === "ROLE_ADMIN"}
                    dropdownStyle={{
                        fontSize: "0.95rem",
                        backgroundColor: "#fffefc",
                    }}
                />
            ),
        },
        {
            title: "عملیات",
            render: (_, r) =>
                r.id === editingUserId ? (
                    <Space>
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            size="small"
                            onClick={() => saveEdit(r.id)}
                        />
                        <Button
                            icon={<CloseOutlined />}
                            size="small"
                            onClick={cancelEdit}
                        />
                    </Space>
                ) : (
                    <Space>
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => startEdit(r)}
                        />
                        <Popconfirm
                            title="آیا از حذف مطمئن هستید؟"
                            onConfirm={() => handleDelete(r.id)}
                            okText="بله"
                            cancelText="خیر"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Popconfirm>
                    </Space>
                ),
        },
    ];

    return (
        <>
            <Title level={4}>کاربران تازه‌وارد (در انتظار تأیید)</Title>
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
