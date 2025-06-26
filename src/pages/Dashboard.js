import { Layout, Menu } from "antd";
import {
    FileTextOutlined,
    TeamOutlined,
    LogoutOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import Documents from "./Documents";
import UsersApproval from "./UsersApproval";
import ReferenceManagement from "./ReferenceManagement";

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

    const menuItems = [
        { key: "documents", icon: <FileTextOutlined />, label: "اسناد" },
        ...(role === "ROLE_ADMIN"
            ? [
                { key: "users", icon: <TeamOutlined />, label: "مدیریت کاربران" },
                { key: "reference", icon: <SettingOutlined />, label: "مدیریت داده‌های پایه" },
            ]
            : []),
        { key: "logout", icon: <LogoutOutlined />, label: "خروج" },
    ];

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
                        fontSize: "2.4rem",
                        margin: 0,
                        color: "#222",
                    }}
                >
                    بایگانی اسناد
                </h1>
            </Header>

            <Layout>
                <Sider
                    width={140}
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
                            border: "none",
                            textAlign: "center",
                            paddingTop: "1rem",
                            height: "100%",
                        }}
                        items={menuItems.map((item) => ({
                            ...item,
                            icon: (
                                <div style={{ fontSize: 100, marginBottom: 50 }}>{item.icon}</div>
                            ),
                            label: (
                                <div
                                    style={{
                                        fontSize: "0.95rem",
                                        lineHeight: 1.4,
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {item.label}
                                </div>
                            ),
                        }))}
                    />
                </Sider>

                <Content
                    style={{
                        margin: "1rem",
                        padding: "1rem",
                        background: "#fff",
                    }}
                >
                    {currentKey === "documents" && <Documents />}
                    {currentKey === "users" && <UsersApproval />}
                    {currentKey === "reference" && <ReferenceManagement />}
                </Content>
            </Layout>
        </Layout>
    );
}

export default Dashboard;
