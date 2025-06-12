
import React from 'react'

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-light dark:bg-dark min-vh-100 d-flex flex-row align-items-center">
      
        {children}
    </div>
  )
}