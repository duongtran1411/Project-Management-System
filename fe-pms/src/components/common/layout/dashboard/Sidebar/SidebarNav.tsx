import { Menu } from 'antd';
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const items: MenuProps['items'] = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: 'Trang chủ',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Cài đặt',
    children: [
      {
        key: 'profile',
        label: 'Hồ sơ',
      },
      {
        key: 'security',
        label: 'Bảo mật',
      },
    ],
  },
];

export default function SidebarNavAntD() {
  return (
    <Menu
      mode="inline"
      style={{ height: '100%', borderRight: 0 }}
      defaultOpenKeys={['settings']}
      items={items}
    />
  );
}
