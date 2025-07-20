"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId;
  useEffect(() => {
    // router.push(`${projectId}/board`);
  }, [router]);
  return null;
}

export default page;
