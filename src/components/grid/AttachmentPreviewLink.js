import React from "react";
import { FullscreenOutlined } from "@ant-design/icons";

function AttachmentPreviewLink({ documentId, file }) {
    const url = `/api/attachments/${documentId}/preview/${file.id}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                color: "#1677ff",
                fontSize: "0.85rem",
            }}
        >
            <FullscreenOutlined />
            مشاهده
        </a>
    );
}

export default AttachmentPreviewLink;
