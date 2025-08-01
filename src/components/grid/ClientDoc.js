import React, {useEffect, useState} from "react";
import {Typography, Input, Spin, message} from "antd";
import {getUser, getClients, getClientsByUnit} from "../../api/api";
import {SearchOutlined} from "@ant-design/icons";
import DocGrid from "./DocGrid";
import AttachmentManager from "./AttachmentManager";

const {Title} = Typography;

function ClientDoc({accessLevel, roles}) {
    const [units, setUnits] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    const isAdmin = Array.isArray(roles) && roles.includes("ROLE_ADMIN");
    const canReadGlobal =
        isAdmin || ["READ", "EDIT", "DOWNLOAD", "OWNER", "REVERT", "ADMIN", "CREATE"].includes(accessLevel);
    const canCreate =
        isAdmin || ["CREATE", "OWNER", "ADMIN"].includes(accessLevel);

    useEffect(() => {

        if (!userId || !role) return;

        setLoadingUnits(true);

        if (role === "ROLE_ADMIN" || role === "ROLE_OWNER") {
            getClients()
                .then((res) => {
                    const clients = res.data || [];
                    const unitMap = new Map();
                    clients.forEach((client) => {
                        if (client.unitId && client.unitName) {
                            unitMap.set(client.unitId, {
                                id: client.unitId,
                                name: client.unitName
                            });
                        }
                    });
                    setUnits(Array.from(unitMap.values()));
                })
                .catch(() => {
                    message.error(" خطا در دریافت لیست مشتری‌ها");
                    setUnits([]);
                })
                .finally(() => {
                    setLoadingUnits(false);
                });
        } else {
            getUser(userId)
                .then((res) => {
                    const userUnits = res.data.units || [];
                    const formatted = userUnits.map((unit) => ({
                        id: unit.id,
                        name: unit.name
                    }));
                    setUnits(formatted);
                })
                .catch(() => {
                    message.error(" خطا در دریافت اطلاعات کاربر");
                    setUnits([]);
                })
                .finally(() => {
                    setLoadingUnits(false);
                });
        }
    }, []);

    const handleUnitSelect = (unitId) => {
        getClientsByUnit(unitId)
            .then((res) => {
                const clients = res.data || [];
                if (clients.length > 0) {
                    setSelectedClient(clients[0]);
                } else {
                    setSelectedClient(null);
                    message.info("هیچ مشتری‌ای برای این واحد یافت نشد");
                }
            })
            .catch(() => {
                message.error(" خطا در دریافت مشتری‌های واحد");
                setSelectedClient(null);
            });
    };

    const filteredUnits = units.filter((unit) =>
        unit.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div style={{display: "flex", gap: "1rem", padding: "1rem"}}>
            {/* ستون سمت راست: لیست واحدها */}
            <div
                style={{
                    width: 180, // ← افزایش عرض
                    minWidth: 180,
                    flexShrink: 0,
                    backgroundColor: "#fff",
                    borderRight: "1px solid #eee",
                    paddingRight: "0.75rem"
                }}
            >
                <Input
                    allowClear
                    prefix={<SearchOutlined/>}
                    placeholder="جست‌وجو واحد"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{marginBottom: "0.75rem"}}
                />

                <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    {/*<div*/}
                    {/*    style={{*/}
                    {/*        fontWeight: "bold",*/}
                    {/*        paddingBottom: "4px",*/}
                    {/*        borderBottom: "1px solid #ccc",*/}
                    {/*        textAlign: "center"*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    لیست واحدها*/}
                    {/*</div>*/}

                    {canReadGlobal && (
                        loadingUnits ? (
                            <Spin/>
                        ) : filteredUnits.length === 0 ? (
                            <div style={{color: "#999", marginTop: "1rem", textAlign: "center"}}>
                                موردی یافت نشد
                            </div>
                        ) : (
                            filteredUnits.map((unit) => (
                                <div
                                    key={unit.id}
                                    onClick={() => handleUnitSelect(unit.id)}
                                    style={{
                                        padding: "6px 0",
                                        borderBottom: "1px dashed #eee",
                                        cursor: "pointer",
                                        textAlign: "center",
                                        backgroundColor:
                                            selectedClient?.unitId === unit.id ? "#e6f7ff" : "transparent",
                                        borderRadius: 4
                                    }}
                                >
                                    {unit.name}
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            {/* ستون سمت چپ: اطلاعات مشتری و DocGrid */}
            <div style={{flexGrow: 1}}>
                {selectedClient ? (
                    <>
                        <div
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                padding: "0.75rem",
                                marginBottom: "0.75rem",
                                lineHeight: "1.2rem",
                                backgroundColor: "#fafafa"
                            }}
                        >
                            <p style={{margin: 0}}>
                                <strong>واحد:</strong> {selectedClient.unitName}
                            </p>
                        </div>

                        <AttachmentManager
                            clientId={selectedClient.id}
                            unitId={selectedClient.unitId}
                            unitName={selectedClient.unitName}
                            serviceId={selectedClient.serviceId}
                            serviceName={selectedClient.serviceName}
                            periodId={selectedClient.periodId}
                            fiscalYear={selectedClient.fiscalYear}
                            accessLevel={accessLevel}
                            roles={roles}
                            currentUser={{ id: userId }}
                        />
                    </>
                ) : (
                    <div style={{color: "#999"}}>
                        لطفاً یک واحد را از لیست سمت راست انتخاب کنید...
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientDoc;
