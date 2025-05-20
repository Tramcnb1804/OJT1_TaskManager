import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Spin,
  message,
  Typography,
  Modal,
  Input,
  Form,
  Button,
  Popconfirm,
  Dropdown,
  Menu,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  DownOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  fetchWithAuth,
  GET_USERS_API,
} from "../config/api";

const { Title } = Typography;

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth(GET_USERS_API);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Bạn chưa đăng nhập hoặc token đã hết hạn.");
        }
        throw new Error("Không thể lấy danh sách người dùng");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      message.error(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({ fullname: user.fullname });
    setIsModalVisible(true);
  };

  const handleUpdateUser = async (values) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3001/users/${editingUser._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) throw new Error("Cập nhật thất bại");

      message.success("Cập nhật thành công");
      setIsModalVisible(false);
      fetchUsers();
    } catch (err) {
      message.error(err.message || "Lỗi không xác định");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetchWithAuth(`http://localhost:3001/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Xóa thất bại");

      message.success("Xóa thành công");
      fetchUsers();
    } catch (err) {
      message.error(err.message || "Lỗi không xác định");
    }
  };

  const handleSoftDeleteUser = async (userId) => {
    try {
      const response = await fetchWithAuth(`http://localhost:3001/users/${userId}/soft-delete`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Ẩn người dùng thất bại");

      message.success("Ẩn người dùng thành công");
      fetchUsers();
    } catch (err) {
      message.error(err.message || "Lỗi không xác định");
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
        <Tag color={role === "admin" ? "red" : "blue"}>{role?.toUpperCase()}</Tag>
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
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                Sửa
              </Menu.Item>
              <Menu.Item icon={<DeleteOutlined />} danger>
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa người dùng này?"
                  onConfirm={() => handleDeleteUser(record._id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <span>Xóa</span>
                </Popconfirm>
              </Menu.Item>
              <Menu.Item icon={<EyeInvisibleOutlined />} onClick={() => handleSoftDeleteUser(record._id)}>
                Ẩn tạm (Soft Delete)
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="link">
            Tuỳ chọn <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản lý người dùng</Title>
      <Button
        type="primary"
        icon={<ArrowLeftOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/task")}
      >
        Quay lại trang Task
      </Button>
      <Spin spinning={loading}>
        <Table
          dataSource={users.map((user) => ({ ...user, key: user._id }))}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />
      </Spin>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Cập nhật người dùng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} onFinish={handleUpdateUser} layout="vertical">
          <Form.Item
            name="fullname"
            label="Họ tên mới"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager;
