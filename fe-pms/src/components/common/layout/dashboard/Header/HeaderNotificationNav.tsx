

import { Badge, Dropdown, Progress } from 'antd'
import { MenuProps } from 'antd'
import Link from 'next/link'
import React from 'react'
import { User, Lock, Mail, Eye } from 'lucide-react'
const ItemWithIcon = ({ icon, children }: { icon: any, children: React.ReactNode }) => (
  <>
    
    {children}
  </>
)

export default async function HeaderNotificationNav() {

  const notificationMenu: MenuProps['items'] = [
    {
      key: 'header',
      label: <strong></strong>,
      type: 'group',
    },
    {
      key: 'new_user',
      label: (
        <Link href="#" legacyBehavior>
          <a><ItemWithIcon icon={User}>user</ItemWithIcon></a>
        </Link>
      ),
    },
    {
      key: 'deleted_user',
      label: (
        <Link href="#" legacyBehavior>
          <a><ItemWithIcon icon={Mail}>mail</ItemWithIcon></a>
        </Link>
      ),
    },
    {
      key: 'sales_report',
      label: (
        <Link href="#" legacyBehavior>
          <a><ItemWithIcon icon={Eye}>eye</ItemWithIcon></a>
        </Link>
      ),
    },
    {
      key: 'new_client',
      label: (
        <Link href="#" legacyBehavior>
          <a><ItemWithIcon icon={Lock}>lock</ItemWithIcon></a>
        </Link>
      ),
    },
    {
      key: 'server_overloaded',
      label: (
        <Link href="#" legacyBehavior>
          <a><ItemWithIcon icon={Eye}>eye</ItemWithIcon></a>
        </Link>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'server_stats',
      label: (
        <div>
          <div><b>3</b></div>
          <Progress percent={25} size="small" />
          <small>348 . 1/4 .</small>
        </div>
      )
    },
    {
      key: 'memory',
      label: (
        <div>
          <div><b>22</b></div>
          <Progress percent={75} status="exception" size="small" />
          <small>11,444GB / 16,384MB</small>
        </div>
      )
    },
    {
      key: 'ssd1',
      label: (
        <div>
          <div><b>11</b></div>
          <Progress percent={90} status="exception" size="small" />
          <small>243GB / 256GB</small>
        </div>
      )
    },
  ]

  return (
    <div className="d-flex align-items-center gap-3">
      <Dropdown
        menu={{ items: notificationMenu }}
        placement="bottomRight"
        trigger={['click']}
        overlayClassName="notification-dropdown"
      >
        <a onClick={e => e.preventDefault()}>
          <Badge count={5} offset={[-5, 5]}>
          </Badge>
        </a>
      </Dropdown>
    </div>
  )
}
