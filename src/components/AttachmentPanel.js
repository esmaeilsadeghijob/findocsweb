import { useState } from "react";
import AttachmentTable from "./AttachmentTable";

function AttachmentPanel({ documentId }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null); // "pdf" یا "image" یا "other"

    const handlePreview = (file) => {
        console.log("::::::::::::::::::::");
        console.log(documentId);
        console.log(file.id);
        console.log("::::::::::::::::::::");

        const url = `http://localhost:8080/api/attachments/public/${documentId}/file/${file.id}`;

        console.log("::::::::::::::::::::");
        console.log(url);
        console.log("::::::::::::::::::::");


        setPreviewUrl(url);

        console.log("::::::::::::::::::::");
        console.log("::::::::::::::::::::");

        const ext = file.extension || file.fileName?.split(".").pop()?.toLowerCase();

        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
            setFileType("image");
        } else if (ext === "pdf") {
            setFileType("pdf");
        } else {
            setFileType("other");
        }
    };

    return (
        <div style={{ display: "flex", gap: 16, height: "80vh" }}>
            {/* جدول فایل‌ها */}
            <div style={{ flex: 1 }}>
                <AttachmentTable documentId={documentId} onPreview={handlePreview} />
            </div>

            {/* پنل پیش‌نمایش */}
            <div
                style={{
                    width: "45%",
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    padding: 8,
                }}
            >
                {previewUrl ? (
                    fileType === "image" ? (
                        <img
                            src={previewUrl}
                            alt="پیش‌نمایش فایل"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                borderRadius: 6,
                            }}
                        />
                    ) : fileType === "pdf" ? (
                        <embed
                            src={previewUrl}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                            style={{ borderRadius: 6 }}
                        />
                    ) : (
                        <div style={{ textAlign: "center", paddingTop: 60 }}>
                            فرمت فایل پشتیبانی نمی‌شود.
                            <br />
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                کلیک کنید برای دانلود فایل
                            </a>
                        </div>
                    )
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            paddingTop: 60,
                            color: "#888",
                            fontFamily: "Tahoma",
                        }}
                    >
                        پیش‌نمایش فایل در این قسمت نمایش داده می‌شود
                    </div>
                )}
            </div>
        </div>
    );
}

export default AttachmentPanel;
