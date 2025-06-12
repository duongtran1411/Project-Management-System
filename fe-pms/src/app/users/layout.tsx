import { Header } from "antd/es/layout/layout";
import { Menu, Button } from "antd";
export function NavBarGuest() {
  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
      <div style={{ color: "#fff", fontWeight: "bold" }}>MyApp</div>

      <Menu
        theme="dark"
        mode="horizontal"
        selectable={false}
        style={{ flex: 1, justifyContent: "center" }}>
        <Menu.Item key="home">Home</Menu.Item>
        <Menu.Item key="about">About</Menu.Item>
        <Menu.Item key="contact">Contact</Menu.Item>
      </Menu>

      <Button type="primary">Login</Button>

      <Button danger>Logout</Button>
    </Header>
  );
}
