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
import React from "react";
import ClientDocument from "../pages/ClientDocument";

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
                { key: "reference", icon: <SettingOutlined />, label: " داده‌های پایه" },
            ]
            : []),
        { key: "logout", icon: <LogoutOutlined />, label: "خروج" },
    ];

    const enhancedMenuItems = rawMenuItems.map((item) => ({
        key: item.key,
        style: {
            minHeight: 180, // 👈 افزایش ارتفاع واقعی آیتم منو
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
                <div style={{ fontSize: "0.9rem", marginTop: 10 }}>{item.label}</div>
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
                    width={160}
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
                    {/*{currentKey === "documents" && <Documents />}*/}
                    {currentKey === "documents" && <ClientDocument />}
                    {currentKey === "users" && <UsersApproval />}
                    {currentKey === "reference" && <ReferenceManagement />}
                </Content>
            </Layout>
        </Layout>
    );
}

export default Dashboard;
