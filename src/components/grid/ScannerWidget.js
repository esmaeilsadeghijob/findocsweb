import React, { useEffect } from "react";
import Dynamsoft from "dwt";
import { Button } from "antd";

const ScannerWidget = ({ onClose }) => {
    useEffect(() => {
        Dynamsoft.DWT.ProductKey = "LICENSE_KEY";

        Dynamsoft.DWT.Load().then(() => {
            const containerId = "dwtcontrol"; // divی که تازه اضافه کردیم
            const scanner = Dynamsoft.DWT.GetWebTwain(containerId);

            if (scanner) {
                scanner.SelectSource(); // نمایش لیست اسکنرها
            } else {
                alert("اسکنر در دسترس نیست یا Agent نصب نشده");
            }
        }).catch((err) => {
            console.error("خطا در لود Dynamsoft:", err);
        });
    }, []);

    const handleScan = () => {
        const scanner = Dynamsoft.DWT.GetWebTwain("dwtcontrol");
        if (scanner) {
            scanner.SelectSourceAsync().then(() => {
                scanner.AcquireImage({
                    IfShowUI: false,
                    PixelType: Dynamsoft.DWT.EnumDWT_PixelType.TWPT_RGB,
                    Resolution: 200,
                });
            }).catch(() => {
                alert("خطا در باز کردن اسکنر");
            });
        } else {
            alert("اسکنر در دسترس نیست یا Agent فعال نیست");
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h3>اسکن فایل جدید</h3>

            <div
                id="dwtcontrol"
                style={{
                    width: "100%",
                    height: "320px",
                    border: "1px dashed #ccc",
                    marginBottom: 24,
                }}
            />

            <Button type="primary" onClick={handleScan}>شروع اسکن</Button>
            <Button style={{ marginRight: 12 }} onClick={onClose} danger>بازگشت</Button>
        </div>
    );
};

export default ScannerWidget;
