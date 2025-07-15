import {useParams} from "react-router-dom";
import {Button} from "antd";

function AttachmentViewer() {
    const { documentId, fileId } = useParams();
    const fileUrl = `/api/attachments/${documentId}/preview/${fileId}`;

    const handlePrint = () => {
        const win = window.open(fileUrl, "_blank");
        win?.print();
    };

    return (
        <div style={{ padding: 32 }}>
            <h2 style={{ textAlign: "center" }}>پیش‌نمایش فایل</h2>

            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    height: "80vh",
                    overflow: "hidden",
                    marginBottom: 24,
                }}
            >
                <iframe
                    src={fileUrl}
                    title="پیش‌نمایش فایل"
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                />
            </div>

            <div style={{ textAlign: "center" }}>
                <Button type="primary" onClick={handlePrint}>
                    چاپ فایل
                </Button>
            </div>
        </div>
    );
}

export default AttachmentViewer;
