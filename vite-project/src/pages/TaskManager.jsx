import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Tag,
  Row,
  Col,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
} from "antd";
import dayjs from "dayjs";
import { UserOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import { GET_TASKS_API, fetchWithAuth } from "../config/api";

const { Option } = Select;
const { RangePicker } = DatePicker;


const memberOptions = ["Alice", "Bob", "Charlie", "David"];

const TaskTable = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(GET_TASKS_API);
      if (!response.ok) {
        setTasks([]);
        return;
      }
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (value, record) => {
    const updatedTasks = tasks.map((task) => {
      if (task._id === record._id) {
        return { ...task, assignedTo: value };
      }
      return task;
    });
    setTasks(updatedTasks);
    // Gọi API update task ở đây nếu cần
  };

  const handleStatusFilterChange = (value) => {
    setFilteredStatus(value === "all" ? null : value);
  };

  const handleCreateTask = async (values) => {
    const { title, description, assignedTo, dateRange } = values;
    const startDate = dateRange[0].toISOString();
    const dueDate = dateRange[1].toISOString();

    try {
      const response = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          assignedTo,
          startDate,
          dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.[0]?.msg || "Lỗi khi tạo task");
      }

      message.success("Tạo task thành công!");
      setIsModalVisible(false);
      form.resetFields();
      fetchTasks(); // refresh lại danh sách
    } catch (err) {
      message.error(err.message || "Lỗi không xác định");
    }
  };

  const columns = [
    {
      title: "Task Name",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Member",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (text, record) => (
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Chọn thành viên"
          value={Array.isArray(record.assignedTo) ? record.assignedTo : [record.assignedTo]}
          onChange={(value) => handleMemberChange(value, record)}
        >
          {memberOptions.map((member) => (
            <Option key={member} value={member}>
              {member}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        if (status === "in progress") color = "orange";
        else if (status === "done") color = "green";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
  ];

  const filteredTasks = filteredStatus
    ? tasks.filter((task) => task.status === filteredStatus)
    : tasks;

  return (
    <div>
<Row justify="space-between" style={{ marginBottom: 16 }}>
  <Col>
    <Button
      type="primary"
      onClick={() => setIsModalVisible(true)}
      style={{ marginRight: 8 }}
    >
      + Tạo Task
    </Button>
    <Button
      type="primary"
      danger
      icon={<UserOutlined />}
      onClick={() => navigate("/users")}
    >
      Quản lý người dùng
    </Button>
  </Col>
  <Col>
    <Select
      defaultValue="all"
      style={{ width: 200 }}
      onChange={handleStatusFilterChange}
    >
      <Option value="all">Tất cả</Option>
      <Option value="todo">Chưa bắt đầu</Option>
      <Option value="in progress">Đang thực hiện</Option>
      <Option value="done">Đã hoàn thành</Option>
    </Select>
  </Col>
</Row>


      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredTasks.map((task) => ({ ...task, key: task._id }))}
          loading={loading}
          rowKey="_id"
        />
      </Spin>

      {/* Modal tạo task */}
      <Modal
        title="Tạo Task Mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Thời gian"
            rules={[{ required: true, message: "Chọn thời gian bắt đầu và kết thúc" }]}
          >
            <RangePicker showTime />
          </Form.Item>
          <Form.Item name="assignedTo" label="Thành viên" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Chọn thành viên">
              {memberOptions.map((member) => (
                <Option key={member} value={member}>
                  {member}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskTable;
