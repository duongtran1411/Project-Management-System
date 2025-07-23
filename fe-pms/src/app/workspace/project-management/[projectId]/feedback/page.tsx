"use client";
import { useParams } from "next/navigation";
import { List, Avatar, Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const feedbacks = [
  {
    name: "Osh",
    username: "@osh4",
    email: "osh4@example.com",
    time: "2 years ago",
    comment:
      "Sure I like it very much but the post-it is so little, I wish to control the size / expand the post it. Can you do that or?",
  },
  {
    name: "Jose",
    username: "@jose36",
    email: "jose36@example.com",
    time: "2 years ago",
    comment: "Tienda de ropa",
  },
  {
    name: "Віта Федорук",
    username: "@e6d20581_cef34",
    email: "vita@example.com",
    time: "2 years ago",
    comment: "Hello",
  },
];
export default function Page() {
  const params = useParams();
  const projectId = params.projectId as string;
  return (
    <div className="bg-zinc-50">
      <Typography className="text-center text-xl font-semibold">Feedback about PMS</Typography>
      <div className="flex justify-end">
        <Button className="bg-blue-500 text-zinc-100 hover:bg-blue-300">
          <PlusOutlined className="mr-1"/>
          Create
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={feedbacks}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar>{item.name.charAt(0)}</Avatar>}
              title={
                <>
                  <span>{item.name}</span>{" "}
                  <span style={{ color: "gray" }}>{item.username}</span>{" "}
                  &middot; <span style={{ color: "gray" }}>{item.time}</span>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {item.email}
                  </div>
                </>
              }
              description={<div style={{ marginTop: 4 }}>{item.comment}</div>}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
