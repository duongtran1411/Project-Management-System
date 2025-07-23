"use client";
import { useParams } from "next/navigation";
import { List, Avatar, Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { FeedBack } from "@/models/feedback/feedback";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import { showErrorToast } from "@/components/common/toast/toast";
import axiosService from "@/lib/services/axios.service";
import { format } from "date-fns";

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
  const [feedbacks, setFeedbacks] = useState<FeedBack[]>([]);

  const fetcher = async (url: string): Promise<FeedBack[]> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url)
      return response.data.data
    } catch (error: any) {
      if (error) {
        showErrorToast(
          error.response.data.message || "Lỗi khi cập nhật sprint!"
        );
      }
    }
    return Promise.reject()
  };

  const { data, error, isLoading } = useSWR(
    `${Endpoints.Feedback.GET_BY_PROJECT_ID(projectId)}`,
    fetcher
  );

  useEffect(() => {
    if(data){
      setFeedbacks(data)
    }
  },[data])
  return (
    <div className="bg-zinc-50">
      <Typography className="text-center text-xl font-semibold">
        Feedback about PMS
      </Typography>
      <div className="flex justify-end">
        <Button className="bg-blue-500 text-zinc-100 hover:bg-blue-300">
          <PlusOutlined className="mr-1" />
          Create
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={feedbacks}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta key={item._id}
              avatar={<Avatar src={item.createdBy.avatar}>{item.createdBy.fullName.charAt(0)}</Avatar>}
              title={
                <>
                  <span>{item.email}</span>{" "}
                  <span style={{ color: "gray" }}>{item.message}</span>{" "}
                  &middot; <span style={{ color: "gray" }}>{item.type}</span>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {item.email}
                  </div>
                </>
              }
              description={<div style={{ marginTop: 4 }}>{format(new Date(item.updatedAt),'yyyy-MM-dd hh:mm')}</div>}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
