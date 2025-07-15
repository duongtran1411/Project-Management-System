'use client'
import { useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const router = useRouter();
  router.push('/workspace/viewall');
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Workspace Page</h1>
    </div>
  );
};

export default page;
