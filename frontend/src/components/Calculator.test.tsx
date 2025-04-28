import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Calculator from "./Calculator";
import client, { Operation } from "../lib/calculator_client";

// 模拟CalculatorClient
jest.mock("../lib/calculator_client", () => {
  return {
    __esModule: true,
    default: {
      calculate: jest.fn(),
    },
    // 从导入的模块中模拟Operation枚举
    Operation: {
      UNSPECIFIED: 0,
      ADD: 1,
      SUBTRACT: 2,
      MULTIPLY: 3,
      DIVIDE: 4,
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
      target: { value: Operation.ADD },
    });

    // 点击计算按钮
    fireEvent.click(screen.getByText("计算"));

    // 验证客户端被正确调用
    expect(client.calculate).toHaveBeenCalledWith({
      leftOperand: 10,
      rightOperand: 5,
      operation: Operation.ADD,
    });

    // 等待结果显示
    await waitFor(() => {
      // 查找结果框
      const resultElement = screen.getByText("15", { exact: false });
      expect(resultElement).toBeInTheDocument();

      // 验证包含了操作数和操作符
      const resultContainer = resultElement.closest("p");
      expect(resultContainer).toHaveTextContent("10");
      expect(resultContainer).toHaveTextContent("+");
      expect(resultContainer).toHaveTextContent("5");
      expect(resultContainer).toHaveTextContent("=");
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
      target: { value: Operation.DIVIDE },
    });

    // 点击计算按钮
    fireEvent.click(screen.getByText("计算"));

    // 验证客户端被正确调用
    expect(client.calculate).toHaveBeenCalledWith({
      leftOperand: 10,
      rightOperand: 0,
      operation: Operation.DIVIDE,
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
