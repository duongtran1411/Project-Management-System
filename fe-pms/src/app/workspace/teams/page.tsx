"use client";

import { Endpoints } from "@/lib/endpoints";
import axiosService from "@/lib/services/axios.service";
import { UserModel } from "@/models/user/PeopleYouWork.model";
import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import Image from "next/image";
import { useMemo, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  axiosService
    .getAxiosInstance()
    .get(url)
    .then((res) => res.data);

const Page = () => {
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}${Endpoints.PeopleYouWorkWith.GET_ALL}`,
    fetcher
  );

  const filteredPeople = useMemo(() => {
    const people: UserModel[] = data?.data || [];
    return people.filter((p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // const showModal = () => setIsModalVisible(true);
  // const handleCancel = () => setIsModalVisible(false);

  return (
    <div className="h-full p-8 bg-white">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <div className="space-x-2">
          {/* <Button>Create team</Button>
          <Button type="primary" onClick={showModal}>
            Add people
          </Button> */}
        </div>
      </header>

      <div className="mb-14">
        <Input
          size="large"
          placeholder="Search people"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <section>
        <h2 className="mb-4 font-semibold text-l">People you work with</h2>
        <div className="flex flex-wrap gap-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error loading people.</div>
          ) : filteredPeople.length > 0 ? (
            filteredPeople.map((person, idx) => {
              const initials = person.fullName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={idx}
                  className="text-center p-4 border rounded-lg shadow-sm hover:shadow-md cursor-pointer bg-white min-w-[150px] h-[180px] flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold mb-3 overflow-hidden">
                    {person.avatar ? (
                      <Image
                        src={person.avatar}
                        alt={person.fullName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized={!person.avatar.startsWith("/")}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <p className="font-semibold">{person.fullName}</p>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500">
              Không có người làm việc cùng nào.
            </div>
          )}
        </div>
      </section>

      {/* <Modal
        title={<span className="text-xl font-bold">Add people to Jira</span>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCancel}>
            Add
          </Button>,
        ]}
        width={600}
      >
        <div className="py-4">
          <label className="font-semibold" htmlFor="names-emails">
            Names or emails <span className="text-red-500">*</span>
          </label>
          <Input
            id="names-emails"
            placeholder="e.g., Maria, maria@company.com"
            className="mt-1"
          />

          <div className="my-4 text-sm text-gray-500">or add from</div>

          <div className="space-y-2">
            <Button
              icon={<FaGoogle />}
              block
              className="flex items-center justify-center !h-auto py-2"
            >
              <span className="ml-2 font-semibold">Google</span>
            </Button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            This site is protected by reCAPTCHA and the Google{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              Terms of Service
            </a>{" "}
            apply.
          </div>
        </div>
      </Modal> */}
    </div>
  );
};

export default Page;
