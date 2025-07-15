"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Typography,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Card,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { format } from "date-fns";
import "quill/dist/quill.snow.css";
import { EmailTemplate } from "@/models/emailtemplate/EmailTemplate";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { showErrorToast } from "@/components/common/toast/toast";
// Dữ liệu mẫu cho email templates

const { Text, Title } = Typography;
const { TextArea } = Input;
const TiptapEditor = dynamic(() => import("@/components/common/TipTapEditor"), {
  ssr: false,
});
const EmailTemplatePage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [emailTemplates, setEmailTemplate] = useState<EmailTemplate[]>();

  const getAll = async (url: string): Promise<EmailTemplate[]> => {
    try {
      const response = await axiosService.getAxiosInstance().get(url);
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error?.data?.response?.messsage || error?.message || "đã có lỗi xảy ra";
      if (errorMessage) {
        showErrorToast(errorMessage);
      }
    }
    return Promise.reject();
  };
  const { data, error, isLoading } = useSWR(
    `${Endpoints.EmailTemplate.GET_ALL}`,
    getAll
  );

  useEffect(() => {
    if (data) {
      console.log("data", data);
      setEmailTemplate(data);
    }
  }, [data]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onRowClick = (record: EmailTemplate) => {
    router.push(`/admin/emailtemplate/${record._id}`);
  };

  const renderTemplate = (
    template: string,
    variables: Record<string, string>
  ) => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, "g");
      result = result.replace(regex, value);
    });
    return result;
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}>
        <Title level={2}>Email Templates</Title>
        <Button
          type="primary"
          onClick={() => router.push("/admin/emailtemplate/new")}>
          Create New Template
        </Button>
      </div>
      <div>
        {Array.isArray(emailTemplates) &&
          emailTemplates &&
          emailTemplates.map((e) => (
            // <Card
            //   style={{ width: 600, height: 600 }}
            //   className="items-center"
            //   key={e._id}>
            //   {/* <div dangerouslySetInnerHTML={{__html: e.body}}></div> */}
            //   <div className="mx-1 border rounded-xl shadow-sm">
            //     <iframe
            //       srcDoc={e.body}
            //       style={{ width: "100%", height: 500, border: "none" }}
            //       sandbox=""
            //       scrolling="no"
            //     />
            //   </div>
            // </Card>
            <Card
              style={{ width: 600 }} // chỉ giới hạn chiều ngang
              className="items-center"
              key={e._id}>
              <h2 className="mb-2 font-semibold hover:cursor-pointer">
                {e.name}
              </h2>
              <div className="mx-1 border rounded-3xl shadow-xl w-full">
                <iframe
                  srcDoc={renderTemplate(e.body, {
                    header: e.header ?? "",
                    subject: e.subject ?? "",
                    footer: e.footer ?? "",
                    createdByName: "Admin", // hoặc e.createdBy
                    updatedAt: format(new Date(e.updatedAt), "dd/MM/yyyy"),
                    avatarUrl: "https://i.pravatar.cc/100",
                    workItemLink: "#",
                  })}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: 400,
                    border: "none",
                  }}
                  sandbox=""
                />
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default EmailTemplatePage;
