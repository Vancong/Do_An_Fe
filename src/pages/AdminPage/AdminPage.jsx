import { Button, Menu, Drawer } from 'antd'
import React, { useState } from 'react'
import {
  UserOutlined, AppstoreOutlined,
  SettingOutlined, RadarChartOutlined, FireOutlined, BarcodeOutlined, ShopOutlined, BarChartOutlined, UngroupOutlined, MenuOutlined
} from '@ant-design/icons';
import { getItem } from '../../utils/menuUtils';
import HeaderCompoent from '../../components/HeaderComponent/HeaderComponent';
import AdminUser from '../../components/AdminUser/AdminUser';
import AdminProduct from '../../components/AdminProduct/AdminProduct';
import "./AdminPage.scss"
import AdminBrand from '../../components/AdminBrand/AdminBrand';
import AdminNote from '../../components/AdminNote/AdminNote';
import AdminNoteGroup from '../../components/AdminNoteGroup/AdminNoteGroup';
import AdminVoucher from '../../components/AdminVoucher/AdminVoucher';
import AdminOrder from '../../components/AdminOrder/AdminOrder';
import AdminWebInfo from '../../components/AdminWebInfo/AdminWebInfo';
import AdminStats from '../../components/AdminStats/AdminStats';

const AdminPage = () => {
  const [open, setOpen] = useState(false);
  const items = [
    getItem('Thống kê', 'stats', <BarChartOutlined />),
    getItem('Quản lý đơn hàng', 'order', <ShopOutlined />),
    getItem('Mã giảm giá', 'voucher', <BarcodeOutlined />),
    getItem('Sản phẩm', 'product', <AppstoreOutlined />),
    getItem('Người dùng', 'user', <UserOutlined />,),
    getItem('Thương Hiệu', 'brand', <RadarChartOutlined />),
    getItem('Note ', 'note', <FireOutlined />),
    getItem('Nhóm hương', 'note-group', <UngroupOutlined />),
    getItem('Thông tin website', 'webinfo', <SettingOutlined />),
  ]

  const [keySelected, setKeySelected] = useState(localStorage.getItem('adminKey') || 'stats');

  const renderPage = (key) => {
    switch (key) {
      case ('stats'): return <AdminStats />
      case ('user'): return <AdminUser />
      case ('order'): return <AdminOrder />
      case ('product'): return <AdminProduct />
      case ('webinfo'): return <AdminWebInfo />
      case ('voucher'): return <AdminVoucher />
      case ('brand'): return <AdminBrand />
      case ('note'): return <AdminNote />
      case ('note-group'): return <AdminNoteGroup />
      default: return <></>
    }
  }

  const handleOnclick = ({ key }) => {
    setKeySelected(key)
    localStorage.setItem('adminKey', key);
    setOpen(false); // Close drawer on selection
  }

  return (
    <>
      <HeaderCompoent isHiddenSearch={true} isHiddenCart={true} isHiddenMenu={true} isHiddenFavorite={true} />
      <div className='admin_page'>

        {/* Mobile Toggle Button */}
        <div className="mobile-menu-toggle-admin">
          <Button icon={<MenuOutlined />} onClick={() => setOpen(true)} type="primary" />
          <span style={{ marginLeft: 10, fontWeight: 'bold' }}>Menu Quản lý</span>
        </div>

        {/* Desktop Sidebar - Hidden on mobile via CSS */}
        <div className="desktop-sidebar">
          <Menu
            mode='inline'
            style={{
              width: 256,
              boxShadow: '1px 1px 2px #ccc',
              height: '100%',
            }}
            items={items}
            onClick={handleOnclick}
            selectedKeys={[keySelected]}
          />
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Quản lý"
          placement="left"
          onClose={() => setOpen(false)}
          open={open}
          width={260}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode='inline'
            style={{ borderRight: 0 }}
            items={items}
            onClick={handleOnclick}
            selectedKeys={[keySelected]}
          />
        </Drawer>

        <div className='content' >
          {renderPage(keySelected)}
        </div>
      </div>
    </>
  )
}

export default AdminPage