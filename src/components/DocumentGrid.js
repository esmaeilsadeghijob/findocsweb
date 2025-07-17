// import React, {useEffect, useMemo, useState} from "react";
// import {Button, Input, message, Popconfirm, Space, Tag, Tooltip,} from "antd";
// import {DeleteOutlined, EditOutlined, FileAddOutlined, SearchOutlined,} from "@ant-design/icons";
// import {advanceDocumentStatus, deleteDocument, getDocumentsByClientId,} from "../api/api";
//
// import AddDocumentModal from "./AddDocumentModal";
// import UploadModal from "./UploadModal";
//
// import {AgGridReact} from "ag-grid-react";
// import {ClientSideRowModelModule, ModuleRegistry} from "ag-grid-community";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import {MasterDetailModule} from '@ag-grid-enterprise/master-detail';
//
// ModuleRegistry.registerModules([
//     ClientSideRowModelModule,
//     MasterDetailModule
// ]);
//
// function DocumentGrid({clientId}) {
//     const [documents, setDocuments] = useState([]);
//     const [searchText, setSearchText] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [showModal, setShowModal] = useState(false);
//     const [selectedDoc, setSelectedDoc] = useState(null);
//
//     const fetchDocs = async () => {
//         setLoading(true);
//         try {
//             const res = await getDocumentsByClientId(clientId);
//             const filtered = res.data.filter((doc) => doc.accessLevel !== "NONE");
//             setDocuments(filtered);
//         } catch {
//             message.error("خطا در دریافت اسناد");
//             setDocuments([]);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     useEffect(() => {
//         if (clientId) fetchDocs();
//     }, [clientId]);
//
//     const handleDelete = async (id) => {
//         try {
//             await deleteDocument(id);
//             message.success("سند حذف شد");
//             fetchDocs();
//         } catch {
//             message.error("خطا در حذف سند");
//         }
//     };
//
//     const handleStatusChange = async (id) => {
//         try {
//             const res = await advanceDocumentStatus(id);
//             const updated = res.data;
//             setDocuments((prev) =>
//                 prev.map((doc) => (doc.id === updated.id ? updated : doc))
//             );
//         } catch {
//             message.error("خطا در تغییر وضعیت سند");
//         }
//     };
//
//     const filteredDocs = useMemo(() => {
//         if (!searchText) return documents;
//         return documents.filter((doc) =>
//             Object.values(doc).some(
//                 (val) =>
//                     typeof val === "string" &&
//                     val.toLowerCase().includes(searchText.toLowerCase())
//             )
//         );
//     }, [searchText, documents]);
//
//     const columnDefs = [
//         {
//             headerName: "",
//             field: "expand",
//             cellRenderer: "agGroupCellRenderer",
//             width: 40,
//             suppressMenu: true,
//             suppressSorting: true,
//             pinned: "left",
//         }, {
//             headerName: "عملیات",
//             colId: "actions",
//             width: 200,
//             cellRendererFramework: (params) => {
//                 const access = params.data.accessLevel;
//                 const record = params.data;
//
//                 return (
//                     <Space>
//                         {["EDIT", "OWNER"].includes(access) && (
//                             <Button
//                                 icon={<EditOutlined/>}
//                                 onClick={() => {
//                                     message.info(`ویرایش سند ${record.documentNumber}`);
//                                 }}
//                                 size="small"
//                             />
//                         )}
//                         {["EDIT", "OWNER"].includes(access) && (
//                             <Popconfirm
//                                 title="سند حذف شود؟"
//                                 onConfirm={() => handleDelete(record.id)}
//                                 okText="بله"
//                                 cancelText="خیر"
//                             >
//                                 <Button icon={<DeleteOutlined/>} danger size="small"/>
//                             </Popconfirm>
//                         )}
//                     </Space>
//                 );
//             },
//         },
//         // {
//         //     headerName: "سطح دسترسی",
//         //     field: "accessLevel",
//         //     width: 120,
//         //     cellRenderer: (p) => <Tag color="blue">{p.value}</Tag>,
//         // },
//         {
//             headerName: "وضعیت",
//             field: "status",
//             width: 120,
//             cellRenderer: (params) => {
//                 const status = params.value;
//                 const color =
//                     status === "DRAFT"
//                         ? "default"
//                         : status === "SUBMITTED"
//                             ? "orange"
//                             : "green";
//                 const label =
//                     status === "DRAFT"
//                         ? "پیش‌نویس"
//                         : status === "SUBMITTED"
//                             ? "ثبت‌شده"
//                             : "قطعی";
//                 const next =
//                     status === "DRAFT"
//                         ? "ثبت‌شده"
//                         : status === "SUBMITTED"
//                             ? "قطعی"
//                             : null;
//
//                 return (
//                     <Tooltip title={next ? `تغییر به ${next}` : "نهایی‌شده"}>
//                         <Tag
//                             color={color}
//                             style={{
//                                 cursor: status === "FINALIZED" ? "not-allowed" : "pointer",
//                             }}
//                             onClick={() =>
//                                 status !== "FINALIZED" && handleStatusChange(params.data.id)
//                             }
//                         >
//                             {label}
//                         </Tag>
//                     </Tooltip>
//                 );
//             },
//         },
//         {
//             headerName: "شرح",
//             field: "description",
//             flex: 1,
//         },
//         // {
//         //     headerName: "سرویس",
//         //     field: "serviceName",
//         //     width: 120,
//         //     cellRenderer: (p) => p.value || "—",
//         // },
//         {
//             headerName: "واحد",
//             field: "unitName",
//             width: 120,
//             cellRenderer: (p) => p.value || "—",
//         },
//         {
//             headerName: "سال مالی",
//             field: "periodFiscalYear",
//             width: 120,
//             cellRenderer: (p) => p.value || "—",
//         },
//         {
//             headerName: "شماره سند",
//             field: "documentNumber",
//             width: 120,
//         },
//     ];
//
//     return (
//         <div>
//             <div style={{marginBottom: "1rem", display: "flex", gap: 16}}>
//                 <Input
//                     allowClear
//                     prefix={<SearchOutlined/>}
//                     placeholder="جست‌وجو در اسناد"
//                     value={searchText}
//                     onChange={(e) => setSearchText(e.target.value)}
//                     style={{width: 360}}
//                 />
//
//                 <Button
//                     icon={<FileAddOutlined/>}
//                     type="primary"
//                     onClick={() => setShowModal(true)}
//                 >
//                     افزودن سند
//                 </Button>
//             </div>
//
//             <div className="ag-theme-alpine" style={{width: "100%"}}>
//                 <AgGridReact
//                     rowData={filteredDocs}
//                     columnDefs={columnDefs}
//                     modules={[ClientSideRowModelModule]}
//                     masterDetail={true}
//                     groupDisplayType="single"
//                     isRowMaster={() => true}
//                     // detailCellRendererFramework={(params) => (
//                     //     <AttachmentPanel
//                     //         documentId={params.data.id}
//                     //         status={params.data.status}
//                     //     />
//                     // )}
//                     detailCellRendererFramework={(params) => (
//                         <div style={{ padding: 20, background: "#ffe" }}>
//                             پنل تستی برای سند {params.data.id}
//                         </div>
//                     )}
//
//                     detailRowHeight={600}
//                     domLayout="autoHeight"
//                     getRowNodeId={(data) => data.id}
//                     suppressRowClickSelection={true}
//                     enableCellTextSelection={true}
//                     // ❌ بدون ستون agGroupCellRenderer
//                 />
//
//             </div>
//
//             {showModal && (
//                 <AddDocumentModal
//                     clientId={clientId}
//                     onSuccess={() => {
//                         setShowModal(false);
//                         fetchDocs();
//                     }}
//                     onCancel={() => setShowModal(false)}
//                 />
//             )}
//
//             {selectedDoc && (
//                 <UploadModal
//                     documentId={selectedDoc}
//                     onClose={() => setSelectedDoc(null)}
//                     onSuccess={() => {
//                         setSelectedDoc(null);
//                         fetchDocs();
//                     }}
//                 />
//             )}
//         </div>
//     );
// }
//
// export default DocumentGrid;
