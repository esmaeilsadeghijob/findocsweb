import {useRef, useState} from "react";
import AttachmentTable from "./AttachmentTable";
import UploadModal from "./UploadModal";
import {UploadOutlined} from "@ant-design/icons";
import {Button} from "antd";

function AttachmentPanel({documentId, status}) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const tableRef = useRef();

    const handlePreview = (file) => {
        const url = `http://localhost:8080/api/attachments/public/${documentId}/file/${file.id}`;
        setPreviewUrl(url);

        const ext =
            file.extension || file.fileName?.split(".").pop()?.toLowerCase();
        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
            setFileType("image");
        } else if (ext === "pdf") {
            setFileType("pdf");
        } else {
            setFileType("other");
        }
    };

    const handleRefresh = () => {
        tableRef.current?.reload();
    };

    return (
        <div style={{display: "flex", gap: 16, height: "80vh"}}>
            <div style={{flex: 1}}>
                {status !== "FINALIZED" && (
                    <div style={{marginTop: 8, textAlign: "end"}}>
                        <Button
                            type="link"
                            icon={<UploadOutlined style={{
                                fontSize: "1.1rem",
                                marginBottom: 2,
                            }}
                            />}
                            onClick={() => setShowModal(true)}
                            style={{
                                fontSize: "1.05rem",         // ← بزرگ‌تر از حالت پیش‌فرض
                                fontWeight: "bold",          // ← ضخیم‌تر
                                paddingInline: 12,
                                paddingBlock: 4,
                            }}
                        >
                            بارگذاری فایل جدید
                        </Button>
                    </div>
                )}


                <AttachmentTable
                    ref={tableRef}
                    documentId={documentId}
                    status={status}
                    onPreview={handlePreview}
                />


                {status !== "FINALIZED" && showModal && (
                    <UploadModal
                        documentId={documentId}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            handleRefresh();
                            setShowModal(false);
                        }}
                    />
                )}
            </div>

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
                            style={{borderRadius: 6}}
                        />
                    ) : (
                        <div style={{textAlign: "center", paddingTop: 60}}>
                            فرمت فایل پشتیبانی نمی‌شود.
                            <br/>
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                دانلود فایل
                            </a>
                        </div>
                    )
                ) : (
                    <div style={{textAlign: "center", paddingTop: 60, color: "#888"}}>
                        پیش‌نمایش فایل در این قسمت نمایش داده می‌شود
                    </div>
                )}
            </div>
        </div>
    );
}

export default AttachmentPanel;
