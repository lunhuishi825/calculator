import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-web";

// 导入生成的服务和消息类型
import { CalculatorService } from "../gen/calculator/v1/calculator_connectweb";
import {
  CalculateRequest,
  CalculateResponse,
  Operation,
} from "../gen/calculator/v1/calculator_pb";

// 导出操作枚举以供应用使用
export { Operation } from "../gen/calculator/v1/calculator_pb";

// 客户端接口定义
export interface SimpleCalculateRequest {
  leftOperand: number;
  rightOperand: number;
  operation: Operation;
}

export interface SimpleCalculateResponse {
  result: number;
  error?: string;
}

// 判断是否在测试环境中
const isTestEnvironment = process.env.NODE_ENV === "test";

// 创建Connect传输层
const transport = createConnectTransport({
  baseUrl: "http://localhost:8081",
  useBinaryFormat: false, // 使用JSON格式而不是二进制，更易于调试
});

// 创建ConnectRPC客户端
const connectClient = createPromiseClient(CalculatorService, transport);

// 包装客户端以匹配现有接口
const client = {
  calculate: async (
    request: SimpleCalculateRequest
  ): Promise<SimpleCalculateResponse> => {
    try {
      // 创建请求对象 - 使用生成的类
      const calculatorRequest = new CalculateRequest({
        leftOperand: request.leftOperand,
        rightOperand: request.rightOperand,
        operation: request.operation,
      });

      // 使用ConnectRPC调用后端
      const response = await connectClient.calculate(calculatorRequest);

      // 返回结果
      return {
        result: response.result,
        error: response.error || undefined,
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
