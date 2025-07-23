// import React, {useEffect, useMemo, useState} from "react";
// import {
//     Input,
//     message,
//     Spin,
//     Typography,
//     Button,
//     Modal
// } from "antd";
// import {
//     SearchOutlined,
//     PlusOutlined,
//     EditOutlined,
//     CloseOutlined
// } from "@ant-design/icons";
// import {
//     getClients,
//     deleteClient
// } from "../api/api";
// import ClientCreateModal from "../components/ClientCreateModal";
// import DocGrid from "../components/grid/DocGrid";
// import {canCreate} from "../components/grid/accessUtils";
//
// const {Title} = Typography;
//
// function ClientDocument() {
//     const [searchText, setSearchText] = useState("");
//     const [selectedClient, setSelectedClient] = useState(null);
//     const [clients, setClients] = useState([]);
//     const [loadingClients, setLoadingClients] = useState(true);
//     const [showClientModal, setShowClientModal] = useState(false);
//     const [editClientModal, setEditClientModal] = useState(false);
//     const [clientToEdit, setClientToEdit] = useState(null);
//     const [userRole, setUserRole] = useState();
//     const [accessLevel, setAccessLevel] = useState();
//     const [roles, setRoles] = useState([]);
//     const [userId, setUserId] = useState();
//
//     const fetchClients = async () => {
//         setLoadingClients(true);
//         try {
//             const response = await getClients();
//             const activeClients = response.data.filter((c) => c.active !== false);
//             setClients(activeClients);
//         } catch {
//             message.error("خطا در دریافت مشتری‌ها");
//             setClients([]);
//         } finally {
//             setLoadingClients(false);
//         }
//     };
//
//     useEffect(() => {
//         const userIdFromStorage = localStorage.getItem("userId");
//         const roleFromStorage = localStorage.getItem("role");
//         const accessFromStorage = localStorage.getItem("documentAccess");
//         setUserRole(roleFromStorage);
//         setAccessLevel(accessFromStorage);
//         setRoles([roleFromStorage]);
//         setUserId(userIdFromStorage);
//         fetchClients();
//     }, []);
//
//     const filteredClients = useMemo(() => {
//         if (!searchText) return clients;
//         return clients.filter((c) =>
//             Object.values(c).some(
//                 (val) =>
//                     typeof val === "string" &&
//                     val.toLowerCase().includes(searchText.toLowerCase())
//             )
//         );
//     }, [searchText, clients]);
//
//     const handleDeleteClient = (client) => {
//         Modal.confirm({
//             title: "آیا مطمئن هستید؟",
//             content: `مشتری "${client.unitName}" حذف شود؟`,
//             okText: "بله، حذف شود",
//             okType: "danger",
//             cancelText: "انصراف",
//             onOk: async () => {
//                 try {
//                     await deleteClient(client.id);
//                     message.success(" مشتری حذف شد");
//                     fetchClients();
//                     if (selectedClient?.id === client.id) {
//                         setSelectedClient(null);
//                         localStorage.removeItem("unitName");
//                     }
//                 } catch {
//                     message.error("❌ خطا در حذف مشتری");
//                 }
//             }
//         });
//     };
//
//     return (
//         <div style={{display: "flex", gap: "2rem", padding: "2rem"}}>
//             {/* ستون مشتری‌ها سمت راست */}
//             <div style={{width: 220}}>
//                 {/*{canCreate(userRole, accessLevel) && (*/}
//                 {/*    <Button*/}
//                 {/*        type="text"*/}
//                 {/*        icon={<PlusOutlined/>}*/}
//                 {/*        style={{*/}
//                 {/*            fontSize: "1rem",*/}
//                 {/*            padding: "0 6px",*/}
//                 {/*            marginBottom: "0.5rem",*/}
//                 {/*            color: "#1890ff",*/}
//                 {/*            width: "100%",*/}
//                 {/*            textAlign: "center"*/}
//                 {/*        }}*/}
//                 {/*        onClick={() => setShowClientModal(true)}*/}
//                 {/*    >*/}
//                 {/*        افزودن مشتری جدید*/}
//                 {/*    </Button>*/}
//                 {/*)}*/}
//
//                 <Title level={5}>لیست مشتری‌ها</Title>
//                 <Input
//                     allowClear
//                     prefix={<SearchOutlined/>}
//                     placeholder="جست‌وجو مشتری"
//                     value={searchText}
//                     onChange={(e) => setSearchText(e.target.value)}
//                     style={{marginBottom: "1rem"}}
//                 />
//
//                 <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
//                     <div
//                         style={{
//                             display: "flex",
//                             fontWeight: "bold",
//                             paddingBottom: "4px",
//                             borderBottom: "1px solid #ccc"
//                         }}
//                     >
//                         <div style={{width: "100%", textAlign: "center"}}>واحد</div>
//                     </div>
//
//                     {loadingClients ? (
//                         <Spin/>
//                     ) : filteredClients.length === 0 ? (
//                         <div style={{color: "#999", marginTop: "1rem"}}>
//                             موردی یافت نشد
//                         </div>
//                     ) : (
//                         filteredClients.map((client) => (
//                             <div
//                                 key={client.id}
//                                 onClick={() => {
//                                     setSelectedClient(client);
//                                     if (client.unitName) {
//                                         localStorage.setItem("unitName", client.unitName);
//                                     }
//                                 }}
//                                 style={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     alignItems: "center",
//                                     padding: "6px 0",
//                                     borderBottom: "1px dashed #eee",
//                                     backgroundColor:
//                                         selectedClient?.id === client.id
//                                             ? "#f0faff"
//                                             : "transparent",
//                                     cursor: "pointer"
//                                 }}
//                             >
//                                 <div style={{width: "100%"}}>{client.unitName}</div>
//
//                                 {canCreate(userRole, accessLevel) && (
//                                     <div style={{display: "flex", gap: "6px"}}>
//                                         <Button
//                                             type="text"
//                                             icon={
//                                                 <EditOutlined
//                                                     style={{
//                                                         fontSize: 16,
//                                                         color: "#1890ff"
//                                                     }}
//                                                 />
//                                             }
//                                             title="ویرایش"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 setClientToEdit(client);
//                                                 setEditClientModal(true);
//                                             }}
//                                         />
//                                         <Button
//                                             type="text"
//                                             icon={
//                                                 <CloseOutlined
//                                                     style={{
//                                                         fontSize: 16,
//                                                         color: "red"
//                                                     }}
//                                                 />
//                                             }
//                                             title="حذف"
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleDeleteClient(client);
//                                             }}
//                                         />
//                                     </div>
//                                 )}
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//
//             {/* ستون اطلاعات سمت چپ */}
//             <div style={{flex: 1}}>
//                 {selectedClient ? (
//                     <>
//                         <div
//                             style={{
//                                 border: "1px solid #ddd",
//                                 borderRadius: 8,
//                                 padding: "0.75rem",
//                                 marginBottom: "0.75rem",
//                                 lineHeight: "1.2rem"
//                             }}
//                         >
//                             <Title level={5} style={{marginBottom: "0.4rem"}}>
//                                 اطلاعات مشتری انتخاب‌شده
//                             </Title>
//                             <p style={{margin: 0}}>
//                                 <strong>واحد:</strong> {selectedClient.unitName}
//                             </p>
//                         </div>
//
//                         <DocGrid
//                             clientId={selectedClient.id}
//                             unitId={selectedClient.unitId}
//                             unitName={selectedClient.unitName}
//                             serviceId={selectedClient.serviceId}
//                             serviceName={selectedClient.serviceName}
//                             periodId={selectedClient.periodId}
//                             fiscalYear={selectedClient.fiscalYear}
//                             accessLevel={accessLevel}
//                             roles={roles}
//                             currentUser={{ id: userId }}
//                         />
//                     </>
//                 ) : (
//                     <div style={{color: "#999"}}>
//                         لطفاً یک مشتری را از لیست سمت راست انتخاب کنید...
//                     </div>
//                 )}
//             </div>
//
//             {/* مودال افزودن مشتری */}
//             {showClientModal && (
//                 <ClientCreateModal
//                     onClose={() => setShowClientModal(false)}
//                     onSuccess={() => {
//                         setShowClientModal(false);
//                         fetchClients();
//                     }}
//                 />
//             )}
//
//             {/* مودال ویرایش مشتری */}
//             {editClientModal && clientToEdit && (
//                 <ClientCreateModal
//                     mode="edit"
//                     initialData={clientToEdit}
//                     onClose={() => {
//                         setEditClientModal(false);
//                         setClientToEdit(null);
//                     }}
//                     onSuccess={() => {
//                         setEditClientModal(false);
//                         setClientToEdit(null);
//                         fetchClients();
//                     }}
//                 />
//             )}
//         </div>
//     );
// }
//
// export default ClientDocument;
