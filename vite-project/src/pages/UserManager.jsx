import React, { useEffect, useState } from "react";
import { Table, Tag, Spin, message, Typography } from "antd";
import dayjs from "dayjs";
import { fetchWithAuth } from "../config/api"; // dùng nếu bạn đã tạo sẵn
// hoặc dùng fetch thông thường nếu chưa

const { Title } = Typography;

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      message.error("Bạn chưa đăng nhập hoặc token bị thiếu.");
      setLoading(false);
      return;
    }

    try {
      // Nếu bạn đã có fetchWithAuth → dùng luôn:
      const response = await fetchWithAuth("http://localhost:3001/users");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể lấy danh sách người dùng");
      }

      setUsers(data);
    } catch (err) {
      message.error(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "blue"}>{role.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản lý người dùng</Title>
      <Spin spinning={loading}>
        <Table
          dataSource={users.map((user) => ({ ...user, key: user._id }))}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />
      </Spin>
    </div>
  );
};

export default UserManager;
