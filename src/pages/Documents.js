import { Table, Button } from "antd";
import { useEffect, useState } from "react";
import { getDocuments } from "../api";
import UploadModal from "../components/UploadModal";

function Documents() {
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        getDocuments().then((res) => setDocs(res.data));
    }, []);

    const columns = [
        { title: "شماره سند", dataIndex: "documentNumber" },
        { title: "سال مالی", dataIndex: "fiscalYear" },
        { title: "توضیحات", dataIndex: "description" },
        {
            title: "ضمیمه",
            render: (_, record) => (
                <Button type="link" onClick={() => setSelectedDoc(record.id)}>
                    بارگذاری فایل
                </Button>
            ),
        },
    ];

    return (
        <>
            <Table rowKey="id" dataSource={docs} columns={columns} />
            {selectedDoc && (
                <UploadModal
                    documentId={selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                />
            )}
        </>
    );
}

export default Documents;
