import client, { Operation } from "./calculator_client";
import { createPromiseClient } from "@bufbuild/connect";

// 模拟createPromiseClient函数
jest.mock("@bufbuild/connect", () => ({
  createPromiseClient: jest.fn(() => ({
    calculate: jest.fn(),
  })),
}));

// 模拟全局fetch函数
global.fetch = jest.fn();

describe("计算器客户端", () => {
  beforeEach(() => {
    // 清除所有模拟调用记录
    jest.clearAllMocks();
  });

  test("成功调用计算方法", async () => {
    // 模拟ConnectRPC客户端返回
    const mockResponse = { result: 15, error: "" };
    const mockCalculate = jest.fn().mockResolvedValue(mockResponse);

    // 替换模拟实现
    const clientMock = { calculate: mockCalculate };
    (createPromiseClient as jest.Mock).mockReturnValue(clientMock);

    // 执行计算
    const result = await client.calculate({
      leftOperand: 10,
      rightOperand: 5,
      operation: Operation.ADD,
    });

    // 验证ConnectRPC客户端被正确调用
    expect(mockCalculate).toHaveBeenCalled();

    // 验证请求参数
    const requestArg = mockCalculate.mock.calls[0][0];
    expect(requestArg.leftOperand).toBe(10);
    expect(requestArg.rightOperand).toBe(5);
    expect(requestArg.operation).toBe(Operation.ADD);

    // 验证响应被正确处理
    expect(result).toEqual({ result: 15, error: undefined });
  });

  test("处理错误响应", async () => {
    // 模拟ConnectRPC客户端返回错误
    const mockResponse = { result: 0, error: "除数不能为零" };
    const mockCalculate = jest.fn().mockResolvedValue(mockResponse);

    // 替换模拟实现
    const clientMock = { calculate: mockCalculate };
    (createPromiseClient as jest.Mock).mockReturnValue(clientMock);

    // 执行计算
    const result = await client.calculate({
      leftOperand: 10,
      rightOperand: 0,
      operation: Operation.DIVIDE,
    });

    // 验证响应被正确处理
    expect(result).toEqual({ result: 0, error: "除数不能为零" });
  });

  test("处理网络错误", async () => {
    // 模拟ConnectRPC客户端抛出错误
    const mockError = new Error("网络连接失败");
    const mockCalculate = jest.fn().mockRejectedValue(mockError);

    // 替换模拟实现
    const clientMock = { calculate: mockCalculate };
    (createPromiseClient as jest.Mock).mockReturnValue(clientMock);

    // 执行计算
    const result = await client.calculate({
      leftOperand: 10,
      rightOperand: 5,
      operation: Operation.ADD,
    });

    // 验证错误被正确处理
    expect(result.error).toContain("请求失败: 网络连接失败");
  });
});
