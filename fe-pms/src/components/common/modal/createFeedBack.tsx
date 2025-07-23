import {
  BugOutlined,
  CheckSquareOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Typography } from "antd";
import { useState } from "react";

const { Option } = Select;
const { Title, Text } = Typography;
interface FeedBackProp {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSave: (message: string, type: string) => void;
}

const CreateFeedBackModal: React.FC<FeedBackProp> = ({
  isModalOpen,
  setIsModalOpen,
  onSave,
}) => {
  const [type,setType] = useState<string>('')
  const [form] = Form.useForm();
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = (values: { message: string}) => {
    onSave(values.message, type);
    setIsModalOpen(false);
    form.resetFields();
  };
  return (
    <Modal
      title={null}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      centered
      width={400}
      bodyStyle={{ padding: 24, textAlign: "center", borderRadius: 8 }}>
      <Title level={3}>FeedBack</Title>
      <Text type="secondary">We will handle your feedback!</Text>

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        style={{ marginTop: 24, textAlign: "left" }}>
        <Form.Item
          label="Message"
          name="message"
          rules={[{ required: true, message: "Email is required" }]}>
          <Input.TextArea placeholder="PLease enter message ..." />
        </Form.Item>

        <Form.Item  label="Type" name='type' rules={[{ required: true, message: "Type is required" }]} >
          <Select placeholder="Select a type" className="w-full" onChange={(value:string) => setType(value)}>
            <Option value="FEATURE_REQUEST">
              <CheckSquareOutlined className="mr-1"/>
              FEATURE_REQUEST
            </Option>
            <Option value="BUG" >
              <BugOutlined className="mr-1"/>
              Bug
            </Option>
            <Option value="COMMENT">
              <CommentOutlined className="mr-1"/>
              Comment
            </Option>
          </Select>
        </Form.Item>
        <Form.Item style={{ marginTop: 32 }}>
          <Button type="primary" block style={{ background: "#030e4f" }} htmlType="submit">
            Send
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateFeedBackModal;
