import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-web";

// 由于我们没有自动生成proto代码，我们需要手动定义接口
export enum Operation {
  OPERATION_UNSPECIFIED = 0,
  OPERATION_ADD = 1,
  OPERATION_SUBTRACT = 2,
  OPERATION_MULTIPLY = 3,
  OPERATION_DIVIDE = 4,
}

export interface CalculateRequest {
  leftOperand: number;
  rightOperand: number;
  operation: Operation;
}

export interface CalculateResponse {
  result: number;
  error?: string;
}

// 创建transport
const transport = createConnectTransport({
  baseUrl: "http://localhost:8081",
  // 添加必要的headers
  useHttpGet: false, // 强制使用POST请求
});

// 判断是否在测试环境中
const isTestEnvironment = process.env.NODE_ENV === "test";

// 创建客户端
const client = {
  calculate: async (request: CalculateRequest): Promise<CalculateResponse> => {
    try {
      // 使用fetch API调用后端，遵循Connect协议
      const response = await fetch(
        "http://localhost:8081/calculator.v1.CalculatorService/Calculate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Connect-RPC 相关头部
            "Connect-Protocol-Version": "1",
          },
          body: JSON.stringify({
            left_operand: request.leftOperand,
            right_operand: request.rightOperand,
            operation: request.operation, // 发送数字值
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 处理错误或成功响应
      if (data.error) {
        return {
          result: 0,
          error: data.error,
        };
      }

      return {
        result: data.result || 0,
        error: undefined,
      };
    } catch (error) {
      // 只在非测试环境输出控制台错误
      if (!isTestEnvironment) {
        console.error("计算请求失败:", error);
      }
      return {
        result: 0,
        error: `请求失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },
};

export default client;
