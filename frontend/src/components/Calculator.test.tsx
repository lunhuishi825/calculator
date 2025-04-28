import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Calculator from "./Calculator";
import client, { Operation } from "../lib/calculator_client";

// 模拟计算器客户端
jest.mock("../lib/calculator_client", () => {
  return {
    __esModule: true,
    default: {
      calculate: jest.fn(),
    },
    Operation: {
      OPERATION_UNSPECIFIED: 0,
      OPERATION_ADD: 1,
      OPERATION_SUBTRACT: 2,
      OPERATION_MULTIPLY: 3,
      OPERATION_DIVIDE: 4,
    },
  };
});

describe("计算器组件", () => {
  beforeEach(() => {
    // 清除所有模拟调用记录
    jest.clearAllMocks();
  });

  test("渲染计算器组件", () => {
    render(<Calculator />);

    // 检查组件是否正确渲染
    expect(screen.getByText("计算器")).toBeInTheDocument();
    expect(screen.getByLabelText("左操作数")).toBeInTheDocument();
    expect(screen.getByLabelText("右操作数")).toBeInTheDocument();
    expect(screen.getByText("计算")).toBeInTheDocument();
  });

  test("进行加法运算", async () => {
    // 模拟客户端计算方法返回加法结果
    const mockCalculateResult = { result: 15, error: undefined };
    (client.calculate as jest.Mock).mockResolvedValue(mockCalculateResult);

    render(<Calculator />);

    // 输入操作数
    fireEvent.change(screen.getByLabelText("左操作数"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("右操作数"), {
      target: { value: "5" },
    });

    // 选择加法操作
    fireEvent.change(screen.getByLabelText("选择操作"), {
      target: { value: Operation.OPERATION_ADD },
    });

    // 点击计算按钮
    fireEvent.click(screen.getByText("计算"));

    // 验证客户端被正确调用
    expect(client.calculate).toHaveBeenCalledWith({
      leftOperand: 10,
      rightOperand: 5,
      operation: Operation.OPERATION_ADD,
    });

    // 等待结果显示 - 使用正则表达式或更精确的查询方法
    await waitFor(() => {
      // 检查结果值为15
      expect(screen.getByText("15", { exact: false })).toBeInTheDocument();
      // 确保操作数和运算符都在
      expect(screen.getByText("10", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("+", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("5", { exact: false })).toBeInTheDocument();
    });
  });

  test("处理除以零错误", async () => {
    // 模拟客户端计算方法返回错误
    const mockCalculateError = { result: 0, error: "除数不能为零" };
    (client.calculate as jest.Mock).mockResolvedValue(mockCalculateError);

    render(<Calculator />);

    // 输入操作数
    fireEvent.change(screen.getByLabelText("左操作数"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("右操作数"), {
      target: { value: "0" },
    });

    // 选择除法操作
    fireEvent.change(screen.getByLabelText("选择操作"), {
      target: { value: Operation.OPERATION_DIVIDE },
    });

    // 点击计算按钮
    fireEvent.click(screen.getByText("计算"));

    // 验证客户端被正确调用
    expect(client.calculate).toHaveBeenCalledWith({
      leftOperand: 10,
      rightOperand: 0,
      operation: Operation.OPERATION_DIVIDE,
    });

    // 等待错误消息显示
    await waitFor(() => {
      expect(screen.getByText("除数不能为零")).toBeInTheDocument();
    });
  });

  test("处理网络错误", async () => {
    // 模拟客户端计算方法抛出错误
    (client.calculate as jest.Mock).mockRejectedValue(new Error("网络错误"));

    render(<Calculator />);

    // 输入操作数
    fireEvent.change(screen.getByLabelText("左操作数"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("右操作数"), {
      target: { value: "5" },
    });

    // 点击计算按钮
    fireEvent.click(screen.getByText("计算"));

    // 等待错误消息显示
    await waitFor(() => {
      expect(screen.getByText(/计算出错: 网络错误/)).toBeInTheDocument();
    });
  });
});
