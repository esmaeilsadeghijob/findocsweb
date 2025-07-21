import React from "react";

const FilePreviewBox = ({ file }) => {
    const url = URL.createObjectURL(file);

    return (
        <div
            style={{
                width: 160,
                height: 160,
                border: "1px solid #ccc",
                borderRadius: 8,
                overflow: "auto",
                background: "#f9f9f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {["image/jpeg", "image/png", "image/jpg"].includes(file.type) ? (
                <img
                    src={url}
                    alt="preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : file.type === "application/pdf" ? (
                <iframe
                    src={url}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="PDF Preview"
                />
            ) : (
                <span style={{ fontSize: 32 }}>📁</span>
            )}
        </div>
    );
};

export default FilePreviewBox;
