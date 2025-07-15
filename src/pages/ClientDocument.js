import React, {useEffect, useMemo, useState} from "react";
import {Input, message, Spin, Typography} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import {getClients} from "../api/api";
import DocumentGrid from "../components/DocumentGrid";

const {Title} = Typography;

function ClientDocument() {
    const [searchText, setSearchText] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            setLoadingClients(true);
            try {
                const response = await getClients();
                const activeClients = response.data.filter((c) => c.active !== false);
                setClients(activeClients);
            } catch {
                message.error("خطا در دریافت مشتری‌ها");
                setClients([]);
            } finally {
                setLoadingClients(false);
            }
        };

        fetchClients();
    }, []);

    const filteredClients = useMemo(() => {
        if (!searchText) return clients;
        return clients.filter((c) =>
            Object.values(c).some(
                (val) =>
                    typeof val === "string" &&
                    val.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText, clients]);

    return (
        <div style={{display: "flex", gap: "2rem", padding: "2rem"}}>
            {/* ستون مشتری‌ها سمت راست */}
            <div style={{width: 200}}>
                <Title level={5}>لیست مشتری‌ها</Title>
                <Input
                    allowClear
                    prefix={<SearchOutlined/>}
                    placeholder="جست‌وجو مشتری"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{marginBottom: "1rem"}}
                />

                <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                    <div
                        style={{
                            display: "flex",
                            fontWeight: "bold",
                            paddingBottom: "4px",
                            borderBottom: "1px solid #ccc",
                        }}
                    >
                        {/*<div style={{width: "50%"}}>شناسه</div>*/}
                        {/*<div style={{width: "25%"}}>سرویس</div>*/}
                        <div style={{width: "100%", textAlign: "center"}}>واحد</div>
                    </div>

                    {loadingClients ? (
                        <Spin/>
                    ) : filteredClients.length === 0 ? (
                        <div style={{color: "#999", marginTop: "1rem"}}>
                            موردی یافت نشد
                        </div>
                    ) : (
                        filteredClients.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => setSelectedClient(client)}
                                style={{
                                    display: "flex",
                                    padding: "6px 0",
                                    borderBottom: "1px dashed #eee",
                                    backgroundColor:
                                        selectedClient?.id === client.id
                                            ? "#f0faff"
                                            : "transparent",
                                    cursor: "pointer",
                                }}
                            >
                                {/*<div*/}
                                {/*    style={{*/}
                                {/*        width: "50%",*/}
                                {/*        fontSize: "1rem",*/}
                                {/*        fontWeight: "bold",*/}
                                {/*    }}*/}
                                {/*>*/}
                                {/*    {client.identifierCode}*/}
                                {/*</div>*/}
                                {/*<div style={{width: "25%"}}>{client.serviceName}</div>*/}
                                <div style={{width: "100%"}}>{client.unitName}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ستون اطلاعات سمت چپ */}
            <div style={{flex: 1}}>
                {selectedClient ? (
                    <>
                        <div
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                padding: "1rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <Title level={5}>اطلاعات مشتری انتخاب‌شده</Title>
                            {/*<p>*/}
                            {/*    <strong>شناسه:</strong> {selectedClient.identifierCode}*/}
                            {/*</p>*/}
                            {/*<p>*/}
                            {/*    <strong>سرویس:</strong> {selectedClient.serviceName}*/}
                            {/*</p>*/}
                            <p>
                                <strong>واحد:</strong> {selectedClient.unitName}
                            </p>
                        </div>

                        <DocumentGrid clientId={selectedClient.id}/>
                    </>
                ) : (
                    <div style={{color: "#999"}}>
                        لطفاً یک مشتری را از لیست سمت راست انتخاب کنید...
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientDocument;