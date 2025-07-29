import {Avatar, Layout, Menu, Tooltip} from "antd";
import {
    FileTextOutlined,
    LogoutOutlined,
    SettingOutlined,
    TeamOutlined,
    UserOutlined
} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import UsersApproval from "../components/UsersApproval";
import ReferenceManagement from "./ReferenceManagement";
import CompanyManagement from "../components/CompanyManagement";
import ClientDoc from "../components/grid/ClientDoc";

const {Header, Sider, Content} = Layout;

function Dashboard() {
    const [currentKey, setCurrentKey] = useState("documents");
    const [identifierCode, setIdentifierCode] = useState();
    const [unitName, setUnitName] = useState();

    const role = localStorage.getItem("role");
    const accessLevel = localStorage.getItem("documentAccess")?.toUpperCase();
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const code = localStorage.getItem("identifierCode");
        setIdentifierCode(code);

        const name = localStorage.getItem("unitName");
        setUnitName(name);

    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.clear();
            window.location = "/login";
        } else {
            setCurrentKey(e.key);
        }
    };

    const rawMenuItems = [
        {key: "documents", icon: <FileTextOutlined/>, label: "بایگانی"},

        ...(role === "ROLE_ADMIN"
            ? [
                {key: "reference", icon: <SettingOutlined/>, label: "امکانات"},
                {key: "users", icon: <TeamOutlined/>, label: "مدیریت کاربران"}
            ]
            : []),

        // فقط اگر نقش ≠ ROLE_USER با سطح NONE باشد، منوی شرکت اضافه شود
        // ...(!(role === "ROLE_USER" && accessLevel === "NONE")
        //     ? [{key: "company", icon: <UserOutlined/>, label: "شرکت (شخص)"}]
        //     : []),

        {key: "logout", icon: <LogoutOutlined/>, label: "خروج"}
    ];

    const enhancedMenuItems = rawMenuItems.map((item) => ({
        key: item.key,
        style: {
            minHeight: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0
        },
        label: (
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                {React.cloneElement(item.icon, {
                    style: {fontSize: 40, color: "#333"}
                })}
                <div style={{fontSize: "0.9rem", marginTop: 8}}>{item.label}</div>
            </div>
        )
    }));

    return (
        <Layout style={{minHeight: "100vh"}}>
            <Header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    background: "#fff",
                    padding: "0 1rem",
                    minHeight: "110px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                }}
            >
                <div style={{ flex: 1 }}></div>

                <div style={{ flex: 3, textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <h1
                            style={{
                                fontFamily: "Lalezar",
                                fontSize: "2.8rem",
                                margin: 0,
                                paddingTop: "1rem",
                                lineHeight: "2.2rem",
                                color: "#222"
                            }}
                        >
                            بایگانی الکترونیکی اسناد و مدارک
                        </h1>

                        {role === "ROLE_ADMIN" ? (
                            <div
                                style={{
                                    fontFamily: "FarBaseet",
                                    fontSize: "1.5rem",
                                    marginTop: "-6px",
                                    color: "#555"
                                }}
                            >
                                مدیر سیستم
                            </div>
                        ) : (
                            identifierCode && (
                                <div
                                    style={{
                                        fontFamily: "FarBaseet",
                                        fontSize: "1.5rem",
                                        marginTop: "-6px",
                                        color: "#555"
                                    }}
                                >
                                    {identifierCode}
                                </div>
                            )
                        )}

                        {unitName && (
                            <div
                                style={{
                                    fontFamily: "FarBaseet",
                                    fontSize: "1.2rem",
                                    marginTop: "2px",
                                    color: "#777"
                                }}
                            >
                                واحد: {unitName}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1, textAlign: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "FarBaseet",
                            gap: "10px"
                        }}
                    >
                        <Tooltip title="صفحه اسناد">
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Avatar
                                    icon={<UserOutlined />}
                                    size={42}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        window.location.href = "/";
                                    }}
                                />
                                <div
                                    onClick={() => (window.location.href = "/")}
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: "bold",
                                        color: "rgb(43,45,48)",
                                        marginTop: "7px",
                                        lineHeight: "1rem",
                                        cursor: "pointer",
                                        userSelect: "none"
                                    }}
                                >
                                    {localStorage.getItem("displayName")?.trim() || localStorage.getItem("username")}
                                </div>
                            </div>
                        </Tooltip>
                        <Tooltip title="خروج">
                            <LogoutOutlined
                                style={{
                                    fontSize: hovered ? "26px" : "18px",
                                    color: hovered ? "rgba(220,0,0,0.8)" : "rgb(30,31,34)",
                                    cursor: "pointer",
                                    transition: "all 0.1s ease-out"
                                }}
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                                onClick={() => {
                                    localStorage.clear();
                                    window.location = "/login";
                                }}
                            />
                        </Tooltip>
                    </div>
                </div>
            </Header>

            <Layout style={{minHeight: "100vh", overflow: "auto"}}>
                <Sider
                    width={150}
                    style={{
                        background: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                    }}
                >
                    <Menu
                        mode="vertical"
                        theme="light"
                        selectedKeys={[currentKey]}
                        onClick={handleMenuClick}
                        style={{
                            background: "#fff",
                            textAlign: "center",
                            border: "none",
                            paddingTop: "1rem",
                            flexGrow: 1
                        }}
                        items={enhancedMenuItems}
                    />

                    {/* لوگو نوشتاری با لینک فعال */}
                    <a
                        href="https://www.hushasoft.ir/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            width: "100%",
                            display: "block",
                            textAlign: "center",
                            fontFamily: "Digikala",
                            fontSize: "0.7rem",
                            color: "#888",
                            padding: "1rem",
                            textDecoration: "none",
                            cursor: "pointer"
                        }}
                    >
                        شرکت دانشوران‌ سرمد
                    </a>
                </Sider>

                <Content style={{margin: "1rem", padding: "1rem", background: "#fff"}}>
                    {currentKey === "documents" && <ClientDoc accessLevel={accessLevel} roles={role}/>}
                    {currentKey === "users" && <UsersApproval/>}
                    {currentKey === "reference" && <ReferenceManagement/>}
                    {currentKey === "company" && <CompanyManagement/>}
                </Content>
            </Layout>
        </Layout>
    );
}

export default Dashboard;
