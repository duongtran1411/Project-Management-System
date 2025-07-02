'use client'

import Link from 'next/link'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'

export default function HeaderFeaturedNav() {
  const items: MenuProps['items'] = [
    {
      key: 'dashboard',
      label: 'Dashboard'
    }
  ]

  return (
    <Menu 
      mode="horizontal" 
      selectable={false}
      items={items}
    />
  )
}
