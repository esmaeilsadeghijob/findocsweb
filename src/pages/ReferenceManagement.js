import React from "react";
import { Tabs } from "antd";
import ClientManager from "../components/ClientManager";
import UnitManager from "../components/UnitManager";
import PeriodManager from "../components/PeriodManager";
import ServiceManager from "../components/ServiceManager";
import CompanyManagement from "../components/CompanyManagement"; // ✅ جایگزین شده
import "./ReferenceManagement.css";
import CategoryManager from "../components/CategoryManager";

const tabStyle = {
    padding: 24,
    boxSizing: "border-box",
    background: "#fff",
    borderRadius: 8,
    minHeight: "calc(100vh - 150px)",
};

function ReferenceManagement() {
    return (
        <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
            <Tabs
                defaultActiveKey="1"
                type="card"
                tabPosition="top"
                size="large"
                style={{ background: "#fff", borderRadius: 8 }}
            >
                <Tabs.TabPane tab="مدیریت مشتری‌ها" key="1">
                    <div style={tabStyle}>
                        <ClientManager />
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="مدیریت واحدها" key="2">
                    <div style={tabStyle}>
                        <UnitManager />
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="مدیریت دوره‌های مالی" key="3">
                    <div style={tabStyle}>
                        <PeriodManager />
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="مدیریت سرویس‌ها" key="4">
                    <div style={tabStyle}>
                        <ServiceManager />
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="مدیریت شرکت‌ها / اشخاص" key="5">
                    <div style={tabStyle}>
                        <CompanyManagement />
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="دسته بندی" key="6">
                    <div style={tabStyle}>
                        <CategoryManager />
                    </div>
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
}

export default ReferenceManagement;
