'use client'

import { useSidebar } from '@/components/common/layout/dashboard/SidebarProvider'
import { Button } from 'antd'
import { MenuOutlined } from '@ant-design/icons'

export default function HeaderSidebarToggler() {
  const {
    showSidebarState: [isShowSidebar, setIsShowSidebar],
  } = useSidebar()

  const toggleSidebar = () => {
    setIsShowSidebar(!isShowSidebar)
  }

  return (
    <Button
      type="text"
      className="header-toggler rounded-0 shadow-none"
      onClick={toggleSidebar}
      icon={<MenuOutlined />}
    />
  )
}
