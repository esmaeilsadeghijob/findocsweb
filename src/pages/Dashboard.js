import {Layout, Menu} from "antd";
import {FileTextOutlined, LogoutOutlined, SettingOutlined, TeamOutlined, UserOutlined,} from "@ant-design/icons";
import React, {useState} from "react";
import UsersApproval from '../components/UsersApproval'; // اگر Dashboard.js داخل src/pages هست
import ReferenceManagement from "./ReferenceManagement";
import ClientDocument from "../pages/ClientDocument";
import CompanyManagement from "../components/CompanyManagement";

const { Header, Sider, Content } = Layout;

function Dashboard() {
    const [currentKey, setCurrentKey] = useState("documents");
    const role = localStorage.getItem("role");

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.clear();
            window.location = "/login";
        } else {
            setCurrentKey(e.key);
        }
    };

    const rawMenuItems = [
        { key: "documents", icon: <FileTextOutlined />, label: "اسناد" },
        ...(role === "ROLE_ADMIN"
            ? [
                { key: "users", icon: <TeamOutlined />, label: "مدیریت کاربران" },
                { key: "reference", icon: <SettingOutlined />, label: "داده‌های پایه" },
            ]
            : []),
        { key: "company", icon: <UserOutlined />, label: "شرکت (شخص)" }, // ✅ منوی جدید
        { key: "logout", icon: <LogoutOutlined />, label: "خروج" },
    ];

    const enhancedMenuItems = rawMenuItems.map((item) => ({
        key: item.key,
        style: {
            minHeight: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
        },
        label: (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                {React.cloneElement(item.icon, {
                    style: { fontSize: 40, color: "#333" },
                })}
                <div style={{ fontSize: "0.9rem", marginTop: 8 }}>{item.label}</div>
            </div>
        ),
    }));

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header
                style={{
                    background: "#fff",
                    padding: "0 1rem",
                    minHeight: "96px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    zIndex: 1,
                }}
            >
                <h1
                    style={{
                        fontFamily: "Lalezar",
                        fontSize: "2.8rem",
                        margin: 0,
                        color: "#222",
                    }}
                >
                    بایگانی اسناد
                </h1>
            </Header>

            <Layout>
                <Sider
                    width={150}
                    style={{
                        background: "#fff",
                        display: "flex",
                        justifyContent: "center",
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
                        }}
                        items={enhancedMenuItems}
                    />
                </Sider>

                <Content
                    style={{
                        margin: "1rem",
                        padding: "1rem",
                        background: "#fff",
                    }}
                >
                    {/* {currentKey === "documents" && <Documents />} */}
                    {currentKey === "documents" && <ClientDocument />}
                    {currentKey === "users" && <UsersApproval />}
                    {currentKey === "reference" && <ReferenceManagement />}
                    {currentKey === "company" && <CompanyManagement />}
                </Content>
            </Layout>
        </Layout>
    );
}

export default Dashboard;
