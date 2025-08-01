import { useState, useEffect, useRef } from "react";
import {
    Card, Button, Table, Modal, Input, Select, Space, message, Popconfirm, Tooltip, DatePicker
} from "antd";
import {
    CloudDownloadOutlined, CloudUploadOutlined, DeleteOutlined,
    ClockCircleOutlined, FolderOpenOutlined, SyncOutlined, RightOutlined, LeftOutlined, StopOutlined
} from "@ant-design/icons";
import {
    getBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    scheduleBackup,
    cancelSchedule
} from "../api/api";
import "./Management.css";
import moment from "moment-jalaali";

const { Option } = Select;
moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

function BackupManager() {
    const [backups, setBackups] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [backupType, setBackupType] = useState("postgres");
    const [path, setPath] = useState("C:\\backups");
    const fileInputRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(moment());
    const [repeatType, setRepeatType] = useState("daily");

    useEffect(() => {
        setSelectedDate(moment());
        fetchBackups();
    }, []);

    // let isCreatingBackup = false;
    //
    // const fetchBackups = async () => {
    //     if (isCreatingBackup) return; // ⛔ جلوگیری از اجراهای هم‌زمان
    //     isCreatingBackup = true;
    //
    //     try {
    //         const res = await getBackups(path);
    //         let files = res.data;
    //
    //         if (!files || files.length === 0) {
    //             await createBackup(backupType, path);
    //             message.success("هیچ بک‌آپی نبود، فایل جدید ایجاد شد");
    //
    //             const updatedRes = await getBackups(path);
    //
    //             files = updatedRes.data;
    //             const sorted = files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    //             setBackups(sorted);
    //
    //             const latest = sorted[0];
    //             await restoreBackup(backupType, `${latest.path}\\${latest.filename}`);
    //             message.success(`بک‌آپ جدید (${latest.filename}) بازگردانی شد`);
    //             return;
    //         }
    //
    //         const sortedFiles = files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    //         setBackups(sortedFiles);
    //
    //         const latest = sortedFiles[0];
    //         await restoreBackup(backupType, `${latest.path}\\${latest.filename}`);
    //         message.success(`آخرین بک‌آپ (${latest.filename}) بازگردانی شد`);
    //     } catch (err) {
    //         message.error("خطا در بارگذاری یا بازگردانی فایل اخیر");
    //     } finally {
    //         isCreatingBackup = false; //  برگردوندن کنترل بعد از پایان اجرا
    //     }
    // };

    let isCreatingBackup = false;

    const fetchBackups = async () => {
        if (isCreatingBackup) return;
        isCreatingBackup = true;

        try {
            const res = await getBackups(path);
            let files = res.data;

            if (!files || files.length === 0) {
                await createBackup(backupType, path);
                message.success("هیچ بک‌آپی نبود، فایل جدید ایجاد شد");

                const updatedRes = await getBackups(path);
                files = updatedRes.data;
            }

            const sortedFiles = files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBackups(sortedFiles);

        } catch (err) {
            message.error("خطا در بارگذاری لیست بک‌آپ‌ها");
        } finally {
            isCreatingBackup = false;
        }
    };

    const handleCreateBackup = async () => {
        try {
            await createBackup(backupType, path);
            message.success("بک‌آپ گرفته شد");

            await fetchBackups();
        } catch {
            message.error("خطا در بک‌آپ‌گیری");
        }
    };

    const handleRestore = async (record) => {
        try {
            await restoreBackup(backupType, `${record.path}\\${record.filename}`);
            message.success("بازگردانی انجام شد");
            fetchBackups()
        } catch {
            message.error("خطا در بازگردانی");
        }
    };

    const handleDelete = async (record) => {
        try {
            await deleteBackup(`${record.path}\\${record.filename}`);
            message.success("بک‌آپ حذف شد");
            fetchBackups();
        } catch {
            message.error("خطا در حذف بک‌آپ");
        }
    };

    const handleScheduleBackup = async () => {
        if (!selectedDate) return message.error("📅 تاریخ و ساعت را انتخاب کنید");

        const hour = selectedDate.hour();
        const minute = selectedDate.minute();

        try {
            await scheduleBackup(backupType, repeatType, hour, minute, path);
            message.success(`📅 زمان‌بندی ثبت شد: ${repeatType} @ ${hour}:${minute}`);
            setModalOpen(false);
        } catch {
            message.error("خطا در زمان‌بندی بک‌آپ‌گیری");
        }
    };

    const handleCancelSchedule = async () => {
        try {
            await cancelSchedule(backupType, path);
            message.success("🛑 زمان‌بندی متوقف شد");
            setModalOpen(false);
        } catch {
            message.error("خطا در توقف زمان‌بندی");
        }
    };

    const handleFolderIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleFolderSelect = (e) => {
        if (e.target.files.length > 0) {
            const fullPath = e.target.files[0].webkitRelativePath;
            const folderSegments = fullPath.split("/");
            folderSegments.pop();
            const folderPath = "/" + folderSegments.join("/");
            setPath(folderPath);
        }
    };

    const columns = [
        { title: "#", render: (_, __, i) => i + 1 },
        { title: "فایل", dataIndex: "filename", align: "center" },
        {
            title: "تاریخ ایجاد",
            dataIndex: "createdAt",
            align: "center",
            render: (value) => moment(value).format("jYYYY/jMM/jDD HH:mm:ss")
        },
        {
            title: "عملیات",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title="📤 بازگردانی این فایل بک‌آپ">
                        <Button icon={<CloudUploadOutlined />} onClick={() => handleRestore(record)}>
                            بازگردانی
                        </Button>
                    </Tooltip>
                    <Tooltip title="🗑 حذف این بک‌آپ (غیرقابل بازگشت)">
                        <Popconfirm
                            title="آیا مطمئن هستید؟"
                            onConfirm={() => handleDelete(record)}
                            okText="بله"
                            cancelText="خیر"
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card className="company-card">
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Space wrap>
                        <Tooltip title="🗄 نوع پایگاه داده برای بک‌آپ‌گیری">
                            <Select value={backupType} onChange={setBackupType}>
                                <Option value="postgres">PostgreSQL</Option>
                                <Option value="mongo">MongoDB</Option>
                            </Select>
                        </Tooltip>

                        <Tooltip title="📁 مسیر پوشه بک‌آپ‌گیری">
                            <Input
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                addonBefore={<FolderOpenOutlined />}
                                style={{
                                    width: 300,
                                    direction: "ltr",
                                    textAlign: "right",
                                    textAlignLast: "left"
                                }}
                            />
                        </Tooltip>

                        <input
                            type="file"
                            webkitdirectory="true"
                            style={{ display: "none" }}
                            ref={fileInputRef}
                            onChange={handleFolderSelect}
                        />

                        <Tooltip title="📦 ایجاد بک‌آپ جدید">
                            <Button icon={<CloudDownloadOutlined />} onClick={handleCreateBackup}>
                                بک‌آپ گیری
                            </Button>
                        </Tooltip>

                        {/*<Tooltip title="⏱ تعریف زمان‌بندی خودکار برای بک‌آپ‌گیری">*/}
                        {/*    <Button icon={<ClockCircleOutlined />} onClick={() => setModalOpen(true)} disabled={true}>*/}
                        {/*        زمان‌بندی*/}
                        {/*    </Button>*/}
                        {/*</Tooltip>*/}

                        {/*<Tooltip title="🔄 بروزرسانی لیست بک‌آپ‌ها">*/}
                        {/*    /!*<Button icon={<SyncOutlined />} onClick={fetchBackups} disabled={true}>*!/*/}
                        {/*    <Button icon={<SyncOutlined />} disabled={true}>*/}
                        {/*        بارگذاری مجدد*/}
                        {/*    </Button>*/}
                        {/*</Tooltip>*/}
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={backups}
                        rowKey={(record) => `${record.filename}_${record.createdAt}`}
                        size="small"
                        pagination={{
                            pageSize: 5,
                            showSizeChanger: false,
                            position: ["bottomCenter"],
                            prevIcon: <RightOutlined />,
                            nextIcon: <LeftOutlined />,
                        }}
                        style={{ marginTop: 16 }}
                    />
                </Space>
            </Card>

            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={[
                    <Tooltip title="🛑 لغو زمان‌بندی فعال فعلی برای بک‌آپ‌ها" key="stop">
                        <Button icon={<StopOutlined />} danger onClick={handleCancelSchedule}>
                            توقف زمان‌بندی
                        </Button>
                    </Tooltip>,
                    <Tooltip title=" ثبت و فعال‌سازی زمان‌بندی جدید" key="submit">
                        <Button type="primary" onClick={handleScheduleBackup}>
                            ثبت
                        </Button>
                    </Tooltip>,
                    <Tooltip title=" خروج بدون ذخیره تغییرات" key="cancel">
                        <Button onClick={() => setModalOpen(false)}>
                            انصراف
                        </Button>
                    </Tooltip>
                ]}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Tooltip title="⏰ انتخاب نوع تکرار برای بک‌آپ‌گیری">
                        <Select
                            value={repeatType}
                            onChange={setRepeatType}
                            placeholder="نوع تکرار"
                            style={{ width: "100%" }}
                        >
                            <Option value="hourly">هر ساعت</Option>
                            <Option value="daily">روزانه</Option>
                            <Option value="weekly">هفتگی</Option>
                            <Option value="monthly">ماهانه</Option>
                            <Option value="yearly">سالانه</Option>
                        </Select>
                    </Tooltip>

                    <Tooltip title="📅 انتخاب ساعت دقیق برای اجرای بک‌آپ">
                        <DatePicker
                            showTime
                            format="jYYYY/jMM/jDD HH:mm"
                            value={selectedDate}
                            onChange={setSelectedDate}
                            style={{ width: "100%" }}
                        />
                    </Tooltip>
                </Space>
            </Modal>
        </>
    );
}

export default BackupManager;
