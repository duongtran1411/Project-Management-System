'use client'

import React, { useEffect, useState } from 'react'
import { Layout, Button } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import classNames from 'classnames'
import { useSidebar } from '@/components/common/layout/dashboard/SidebarProvider'

const { Sider } = Layout

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isNarrow, setIsNarrow] = useState(false)
  const { showSidebarState: [isShowSidebar] } = useSidebar()

  const toggleIsNarrow = () => {
    const newValue = !isNarrow
    localStorage.setItem('isNarrow', newValue ? 'true' : 'false')
    setIsNarrow(newValue)
  }

  useEffect(() => {
    if (localStorage.getItem('isNarrow')) {
      setIsNarrow(localStorage.getItem('isNarrow') === 'true')
    }
  }, [])

  return (
    <Sider
      collapsible
      collapsed={isNarrow}
      onCollapse={toggleIsNarrow}
      width={250}
      collapsedWidth={80}
      className={classNames('site-sidebar border-end', {
        'd-none': !isShowSidebar,
      })}
      style={{ height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 1000, background: '#fff' }}
    >
      {/* Logo */}
      <div
        className="sidebar-brand d-flex align-items-center justify-content-center py-3"
        style={{ height: 64 }}
      >
        {!isNarrow ? (
          <img src="/assets/brand/coreui.svg" alt="Logo" style={{ height: 32 }} />
        ) : (
          <img src="/assets/brand/coreui.svg" alt="Logo" style={{ height: 32, width: 32 }} />
        )}
      </div>

      {/* Sidebar nav */}
      <div className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>

      {/* Toggle button */}
      <div
        style={{
          textAlign: 'center',
          borderTop: '1px solid #f0f0f0',
          padding: '12px 0',
          background: '#fff',
        }}
      >
        <Button
          type="text"
          icon={isNarrow ? <RightOutlined /> : <LeftOutlined />}
          onClick={toggleIsNarrow}
          aria-label="Toggle sidebar"
        />
      </div>
    </Sider>
  )
}
