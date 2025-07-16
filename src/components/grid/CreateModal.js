// import React from "react";
// import { Modal, Form, Input, message } from "antd";
//
// const CreateModal = ({ onClose, onSuccess }) => {
//     const [form] = Form.useForm();
//
//     const handleSubmit = async () => {
//         try {
//             const values = await form.validateFields();
//             message.success("سند جدید ثبت شد");
//             form.resetFields();
//             onSuccess(values);
//         } catch {
//             message.error("لطفاً عنوان را وارد کنید");
//         }
//     };
//
//     return (
//         <Modal
//             open={true}
//             title="ثبت سند جدید"
//             onCancel={onClose}
//             onOk={handleSubmit}
//             okText="ثبت"
//             cancelText="انصراف"
//         >
//             <Form form={form} layout="vertical">
//                 <Form.Item
//                     name="name"
//                     label="عنوان سند"
//                     rules={[{ required: true, message: "عنوان سند الزامی است" }]}
//                 >
//                     <Input placeholder="مثلاً: سند فروش اردیبهشت" />
//                 </Form.Item>
//             </Form>
//         </Modal>
//     );
// };
//
// export default CreateModal;
