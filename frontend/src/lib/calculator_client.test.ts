import client, { Operation } from "./calculator_client";

// 模拟全局fetch函数
global.fetch = jest.fn();

describe("计算器客户端", () => {
  beforeEach(() => {
    // 清除所有模拟调用记录
    jest.clearAllMocks();
  });

  test("成功调用计算方法", async () => {
    // 模拟fetch返回成功响应
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ result: 15 }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    // 执行计算
    const result = await client.calculate({
      leftOperand: 10,
      rightOperand: 5,
      operation: Operation.OPERATION_ADD,
    });

    // 验证fetch被正确调用
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8081/calculator.v1.CalculatorService/Calculate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Connect-Protocol-Version": "1",
        },
        body: JSON.stringify({
          left_operand: 10,
          right_operand: 5,
          operation: Operation.OPERATION_ADD,
        }),
      }
    );

    // 验证响应被正确处理
    expect(result).toEqual({ result: 15, error: undefined });
  });

  test("处理错误响应", async () => {
    // 模拟fetch返回带错误的响应
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ error: "除数不能为零" }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    // 执行计算
    const result = await client.calculate({
      leftOperand: 10,
      rightOperand: 0,
      operation: Operation.OPERATION_DIVIDE,
    });

    // 验证响应被正确处理
    expect(result).toEqual({ result: 0, error: "除数不能为零" });
  });

  test("处理HTTP错误", async () => {
    // 模拟fetch返回HTTP错误
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    // 执行计算
    const result = await client.calculate({
      leftOperand: 10,
      rightOperand: 5,
      operation: Operation.OPERATION_ADD,
    });

    // 验证错误被正确处理
    expect(result.error).toContain("HTTP error! status: 500");
  });

  test("处理网络错误", async () => {
    // 模拟fetch抛出网络错误
    (global.fetch as jest.Mock).mockRejectedValue(new Error("网络连接失败"));

    // 执行计算
    const result = await client.calculate({
      leftOperand: 10,
      rightOperand: 5,
      operation: Operation.OPERATION_ADD,
    });

    // 验证错误被正确处理
    expect(result.error).toContain("请求失败: 网络连接失败");
  });
});
