'use client'
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/workspace/viewall');
  }, [router]);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Workspace Page</h1>
    </div>
  );
};

export default Page;
