import React from "react";
import { Modal } from "antd";
import { Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// تنظیم مسیر worker برای pdfjs-dist
import * as pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfPreview = ({ visible, onClose, base64Data }) => {
    const layoutPluginInstance = defaultLayoutPlugin();

    // بررسی وجود دادهٔ معتبر
    const fileUrl = base64Data
        ? `data:application/pdf;base64,${base64Data}`
        : null;

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            bodyStyle={{ height: "80vh", overflow: "hidden", padding: 0 }}
            destroyOnClose
        >
            {fileUrl ? (
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[layoutPluginInstance]}
                />
            ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                    فایل PDF معتبر یافت نشد
                </div>
            )}
        </Modal>
    );
};

export default PdfPreview;
