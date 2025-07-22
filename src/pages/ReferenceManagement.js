import React, {useEffect, useState} from "react";
import {Tabs} from "antd";
import ClientManager from "../components/ClientManager";
import UnitManager from "../components/UnitManager";
import PeriodManager from "../components/PeriodManager";
import ServiceManager from "../components/ServiceManager";
import CompanyManagement from "../components/CompanyManagement"; // ✅ جایگزین شده
import "./ReferenceManagement.css";
import CategoryManager from "../components/CategoryManager";
import {canCreate} from "../components/grid/accessUtils";
import CustomerManager from "../components/CustomerManager";

const tabStyle = {
    padding: 24,
    boxSizing: "border-box",
    background: "#fff",
    borderRadius: 8,
    minHeight: "calc(100vh - 150px)",
};

function ReferenceManagement() {
    const [userRole, setUserRole] = useState();
    const [accessLevel, setAccessLevel] = useState();

    useEffect(() => {
        const roleFromStorage = localStorage.getItem("role");
        const accessFromStorage = localStorage.getItem("documentAccess");
        setUserRole(roleFromStorage);
        setAccessLevel(accessFromStorage);
    }, []);

    return (
        <div style={{padding: 24, background: "#f5f5f5", minHeight: "100vh"}}>
            <Tabs
                defaultActiveKey="1"
                type="card"
                tabPosition="top"
                size="large"
                style={{background: "#fff", borderRadius: 8}}
            >
                {canCreate(userRole, accessLevel) && (
                    <Tabs.TabPane tab="مشتری‌" key="1">
                        <div style={tabStyle}>
                            <CustomerManager />
                        </div>
                    </Tabs.TabPane>
                )}

                <Tabs.TabPane tab=" واحد" key="2">
                    <div style={tabStyle}>
                        <UnitManager/>
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab=" شناسه " key="3">
                    <div style={tabStyle}>
                        <ClientManager/>
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab=" دوره‌ مالی" key="4">
                    <div style={tabStyle}>
                        <PeriodManager/>
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab=" سرویس‌" key="5">
                    <div style={tabStyle}>
                        <ServiceManager/>
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab=" شرکت‌ / اشخاص" key="6">
                    <div style={tabStyle}>
                        <CompanyManagement/>
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="دسته بندی" key="7">
                    <div style={tabStyle}>
                        <CategoryManager/>
                    </div>
                </Tabs.TabPane>


            </Tabs>
        </div>
    );
}

export default ReferenceManagement;
