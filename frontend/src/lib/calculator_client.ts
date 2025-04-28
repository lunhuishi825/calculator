import { createConnectTransport } from "@bufbuild/connect-web";

// 操作类型枚举，与后端proto定义一致
export enum Operation {
  OPERATION_UNSPECIFIED = 0,
  OPERATION_ADD = 1,
  OPERATION_SUBTRACT = 2,
  OPERATION_MULTIPLY = 3,
  OPERATION_DIVIDE = 4,
}

// 客户端接口定义
export interface CalculateRequest {
  leftOperand: number;
  rightOperand: number;
  operation: Operation;
}

export interface CalculateResponse {
  result: number;
  error?: string;
}

// 判断是否在测试环境中
const isTestEnvironment = process.env.NODE_ENV === "test";

// 创建Connect transport
const transport = createConnectTransport({
  baseUrl: "http://localhost:8081",
});

// 创建计算器客户端
const client = {
  calculate: async (request: CalculateRequest): Promise<CalculateResponse> => {
    try {
      // 转换请求格式，与proto定义一致
      const protoRequest = {
        left_operand: request.leftOperand,
        right_operand: request.rightOperand,
        operation: request.operation,
      };

      // 使用Connect协议调用后端
      const response = await fetch(
        "http://localhost:8081/calculator.v1.CalculatorService/Calculate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Connect-Protocol-Version": "1",
          },
          body: JSON.stringify(protoRequest),
        }
      );

      // 使用连接协议解析响应
      const responseData = await response.json();

      if (!response.ok) {
        const errorCode = response.headers.get("Connect-Protocol-Error-Code");
        const errorMessage = responseData.message || "未知错误";
        throw new Error(`错误(${errorCode}): ${errorMessage}`);
      }

      // 构造响应对象
      return {
        result: responseData.result || 0,
        error: responseData.error,
      };
    } catch (error) {
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
