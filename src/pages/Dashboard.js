import { Layout, Menu } from "antd";
import {
    FileTextOutlined,
    TeamOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import Documents from "./Documents";
import UsersApproval from "./UsersApproval";

const { Header, Sider, Content } = Layout;

function Dashboard() {
    const [currentKey, setCurrentKey] = useState("documents");

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
        { key: "users", icon: <TeamOutlined />, label: "کاربران" },
        { key: "logout", icon: <LogoutOutlined />, label: "خروج" },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[currentKey]}
                    onClick={handleMenuClick}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 1rem",
                        textAlign: "center",
                        fontWeight: "bold",
                    }}
                >
                    داشبورد مدیریتی Findocs
                </Header>
                <Content style={{ margin: "1rem", padding: "1rem", background: "#fff" }}>
                    {currentKey === "documents" && <Documents />}
                    {currentKey === "users" && <UsersApproval />}
                </Content>
            </Layout>
        </Layout>
    );
}

export default Dashboard;
