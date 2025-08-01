import React, { useEffect } from "react";
import Dynamsoft from "dwt";
import { Button } from "antd";

const ScannerWidget = ({ onClose }) => {
    useEffect(() => {
        Dynamsoft.DWT.ProductKey = "LICENSE_KEY";
        Dynamsoft.DWT.Load().then(() => {
            console.log("Dynamsoft Loaded");
        });
    }, []);

    const handleScan = () => {
        const scanner = Dynamsoft.DWT.GetWebTwain("dwtcontrol");
        if (scanner) {
            scanner.SelectSource();
            scanner.OpenSource();
            scanner.AcquireImage();
        } else {
            alert("اسکنر یافت نشد یا Agent نصب نیست");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>اسکن فایل با اسکنر سخت‌افزاری</h2>
            <div id="dwtcontrol" style={{ width: "100%", height: 400 }}></div>

            <div style={{ display: "flex", gap: "10px", marginTop: 20 }}>
                <Button type="primary" onClick={handleScan}>
                    شروع اسکن
                </Button>
                <Button type="default" danger onClick={() => {
                    console.log("دکمه بازگشت کلیک شد");
                    onClose();
                }}>
                    بازگشت به آپلود فایل
                </Button>
            </div>
        </div>
    );
};

export default ScannerWidget;
