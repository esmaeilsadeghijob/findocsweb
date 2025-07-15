// import {Layout, Menu} from "antd";
// import {FileTextOutlined, LogoutOutlined, TeamOutlined,} from "@ant-design/icons";
// import {useState} from "react";
// import Documents from "../pages/Documents";
// import UsersApproval from "../pages/UsersApproval";
//
// const { Header, Sider, Content } = Layout;
//
// function DashboardLayout() {
//     const [key, setKey] = useState("documents");
//
//     const items = [
//         { key: "documents", icon: <FileTextOutlined />, label: "اسناد" },
//         { key: "users", icon: <TeamOutlined />, label: "کاربران" },
//         {
//             key: "logout",
//             icon: <LogoutOutlined />,
//             label: "خروج",
//             onClick: () => {
//                 localStorage.clear();
//                 window.location = "/login";
//             },
//         },
//     ];
//
//     return (
//         <Layout style={{ minHeight: "100vh" }}>
//             <Sider>
//                 <Menu
//                     theme="dark"
//                     selectedKeys={[key]}
//                     mode="inline"
//                     onClick={(e) => {
//                         if (items.find((i) => i.key === e.key)?.onClick) {
//                             items.find((i) => i.key === e.key).onClick();
//                         } else {
//                             setKey(e.key);
//                         }
//                     }}
//                     items={items}
//                 />
//             </Sider>
//             <Layout>
//                 <Header style={{ color: "#fff", textAlign: "center" }}>
//                     داشبورد مدیریتی
//                 </Header>
//                 <Content style={{ margin: "1rem", background: "#fff", padding: "1rem" }}>
//                     {key === "documents" && <Documents />}
//                     {key === "users" && <UsersApproval />}
//                 </Content>
//             </Layout>
//         </Layout>
//     );
// }
//
// export default DashboardLayout;
