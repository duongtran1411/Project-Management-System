"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  useEffect(() => {
    router.push(`${projectId}/board`);
  }, [router, projectId]);
  return null;
};

export default Page;
