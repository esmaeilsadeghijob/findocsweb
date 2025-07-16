import {Avatar, Layout, Menu} from "antd";
import {FileTextOutlined, LogoutOutlined, SettingOutlined, TeamOutlined, UserOutlined,} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import UsersApproval from '../components/UsersApproval';
import ReferenceManagement from "./ReferenceManagement";
import CompanyManagement from "../components/CompanyManagement";
import ClientDocument from "./ClientDocument";

const {Header, Sider, Content} = Layout;

function Dashboard() {
    const [currentKey, setCurrentKey] = useState("documents");
    const [identifierCode, setIdentifierCode] = useState();

    const role = localStorage.getItem("role");

    useEffect(() => {
        const code = localStorage.getItem("identifierCode");
        setIdentifierCode(code);
    }, []);

    const handleMenuClick = (e) => {
        if (e.key === "logout") {
            localStorage.clear();
            window.location = "/login";
        } else {
            setCurrentKey(e.key);
        }
    };

    const rawMenuItems = [{
        key: "documents",
        icon: <FileTextOutlined/>,
        label: "اسناد"
    }, ...(role === "ROLE_ADMIN" ? [{key: "users", icon: <TeamOutlined/>, label: "مدیریت کاربران"}, {
        key: "reference",
        icon: <SettingOutlined/>,
        label: "داده‌های پایه"
    },] : []), {key: "company", icon: <UserOutlined/>, label: "شرکت (شخص)"}, {
        key: "logout",
        icon: <LogoutOutlined/>,
        label: "خروج"
    },];

    const enhancedMenuItems = rawMenuItems.map((item) => ({
        key: item.key, style: {
            minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        }, label: (<div
            style={{
                display: "flex", flexDirection: "column", alignItems: "center",
            }}
        >
            {React.cloneElement(item.icon, {
                style: {fontSize: 40, color: "#333"},
            })}
            <div style={{fontSize: "0.9rem", marginTop: 8}}>{item.label}</div>
        </div>),
    }));

    return (<Layout style={{minHeight: "100vh"}}>
        <Header
            style={{
                position: "sticky",         // ✅ فعال‌سازی sticky
                top: 0,                     // ✅ در بالای صفحه بچسبه
                zIndex: 100,                // ✅ نمایش بالاتر از سایر بخش‌ها
                background: "#fff",
                padding: "0 1rem",
                minHeight: "110px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between", // فاصله‌ی یکنواخت بین بخش‌ها
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                // zIndex: 1,
            }}
        >
            <div style={{flex: 1, textAlign: "center"}}>
                {/* بخش 1: خالی یا قابل تعریف در آینده */}
            </div>

            <div style={{flex: 1, textAlign: "center"}}>
                {/* بخش 2: خالی یا قابل تعریف در آینده */}
            </div>

            <div style={{flex: 1, textAlign: "center"}}>
                {/* ✅ بخش وسط: عنوان + شناسه */}
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <h1
                        style={{
                            fontFamily: "Lalezar",
                            fontSize: "2.8rem",
                            margin: 0,
                            paddingTop: "1rem",
                            lineHeight: "2.2rem",
                            color: "#222",
                        }}
                    >
                        بایگانی اسناد
                    </h1>
                    {identifierCode && (<div
                        style={{
                            fontFamily: "FarBaseet", fontSize: "1.5rem", marginTop: "-6px", color: "#555",
                        }}
                    >
                        {identifierCode}
                    </div>)}
                </div>
            </div>

            <div style={{flex: 1, textAlign: "center"}}>
                {/* بخش 4: خالی یا قابل تعریف در آینده */}
            </div>

            <div style={{flex: 1, textAlign: "center"}}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "FarBaseet",
                        gap: "10px", // فاصله بین ستون کاربر و خروج
                    }}
                >
                    {/* ✅ آواتار و نام کاربری در ستون عمودی */}
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <Avatar
                            icon={<UserOutlined/>}
                            size={42}
                        />


                        <div
                            style={{
                                fontSize: "1rem",
                                fontWeight: "bold",
                                color: "rgb(43,45,48)",
                                marginTop: "7px",
                                lineHeight: "1rem",
                            }}
                        >
                            {localStorage.getItem("displayName")?.trim() ||
                                localStorage.getItem("username")}
                        </div>
                    </div>

                    {/* ✅ آیکون خروج جداگانه کنار آواتار و نام کاربری */}
                    <LogoutOutlined
                        style={{
                            fontSize: "18px",
                            cursor: "pointer",
                            color: "rgba(170,0,0,0.6)",
                        }}
                        onClick={() => {
                            localStorage.clear();
                            window.location = "/login";
                        }}
                    />
                </div>
            </div>


        </Header>

        <Layout style={{minHeight: "100vh", overflow: "auto"}}>
            <Sider
                width={150}
                style={{
                    background: "#fff", display: "flex", justifyContent: "center",
                }}
            >
                <Menu
                    mode="vertical"
                    theme="light"
                    selectedKeys={[currentKey]}
                    onClick={handleMenuClick}
                    style={{
                        background: "#fff", textAlign: "center", border: "none", paddingTop: "1rem",
                    }}
                    items={enhancedMenuItems}
                />
            </Sider>

            <Content
                style={{
                    margin: "1rem", padding: "1rem", background: "#fff",
                }}
            >
                {currentKey === "documents" && <ClientDocument/>}
                {currentKey === "users" && <UsersApproval/>}
                {currentKey === "reference" && <ReferenceManagement/>}
                {currentKey === "company" && <CompanyManagement/>}
            </Content>
        </Layout>
    </Layout>);
}

export default Dashboard;
