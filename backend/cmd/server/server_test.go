package main

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/bufbuild/connect-go"
	"github.com/rs/cors"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	calculatorv1 "calculator/backend/gen/calculator/v1"
	"calculator/backend/gen/calculator/v1/calculatorv1connect"
)

func TestServerIntegration(t *testing.T) {
	// 创建服务器
	calculator := &CalculatorServer{}
	path, handler := calculatorv1connect.NewCalculatorServiceHandler(calculator)

	// 创建路由
	mux := http.NewServeMux()
	mux.Handle(path, handler)

	// 使用CORS中间件
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	handlerWithCors := corsMiddleware.Handler(mux)

	// 创建HTTP服务器
	server := httptest.NewServer(h2c.NewHandler(handlerWithCors, &http2.Server{}))
	defer server.Close()

	// 测试用例
	tests := []struct {
		name           string
		leftOperand    float64
		rightOperand   float64
		operation      calculatorv1.Operation
		expectedResult float64
		expectedError  bool
	}{
		{
			name:           "加法测试",
			leftOperand:    20,
			rightOperand:   10,
			operation:      calculatorv1.Operation_OPERATION_ADD,
			expectedResult: 30,
			expectedError:  false,
		},
		{
			name:           "除法测试",
			leftOperand:    20,
			rightOperand:   0,
			operation:      calculatorv1.Operation_OPERATION_DIVIDE,
			expectedError:  true,
		},
	}

	// 执行测试
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 创建请求体
			requestBody := map[string]interface{}{
				"left_operand":  tt.leftOperand,
				"right_operand": tt.rightOperand,
				"operation":     tt.operation,
			}
			body, _ := json.Marshal(requestBody)

			// 创建HTTP请求
			req, err := http.NewRequest("POST", server.URL+"/calculator.v1.CalculatorService/Calculate", bytes.NewBuffer(body))
			if err != nil {
				t.Fatalf("创建请求失败: %v", err)
			}
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Connect-Protocol-Version", "1")

			// 发送请求
			client := &http.Client{
				Timeout: time.Second * 5,
			}
			resp, err := client.Do(req)
			if err != nil {
				t.Fatalf("发送请求失败: %v", err)
			}
			defer resp.Body.Close()

			// 解析响应
			var result map[string]interface{}
			if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
				t.Fatalf("解析响应失败: %v", err)
			}

			// 断言
			if tt.expectedError {
				// 检查错误或错误字段
				if resp.StatusCode < 400 && result["error"] == nil {
					t.Errorf("期望错误响应，但状态码为 %d，响应为 %v", resp.StatusCode, result)
				}
			} else {
				// 检查成功响应和结果
				if resp.StatusCode != http.StatusOK {
					t.Errorf("期望状态码 %d，但得到 %d", http.StatusOK, resp.StatusCode)
				}
				if resultValue, ok := result["result"].(float64); !ok || resultValue != tt.expectedResult {
					t.Errorf("期望结果 %f，但收到 %v", tt.expectedResult, result["result"])
				}
			}
		})
	}
}

// 创建模拟客户端测试
func TestClientServerInteraction(t *testing.T) {
	// 创建服务器
	calculator := &CalculatorServer{}
	path, handler := calculatorv1connect.NewCalculatorServiceHandler(calculator)

	// 创建路由
	mux := http.NewServeMux()
	mux.Handle(path, handler)

	// 使用CORS中间件
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	handlerWithCors := corsMiddleware.Handler(mux)

	// 创建HTTP服务器
	server := httptest.NewServer(h2c.NewHandler(handlerWithCors, &http2.Server{}))
	defer server.Close()

	// 创建Connect客户端
	client := calculatorv1connect.NewCalculatorServiceClient(
		http.DefaultClient,
		server.URL,
	)

	// 进行计算测试
	req := connect.NewRequest(&calculatorv1.CalculateRequest{
		LeftOperand:  30,
		RightOperand: 5,
		Operation:    calculatorv1.Operation_OPERATION_MULTIPLY,
	})

	resp, err := client.Calculate(context.Background(), req)
	if err != nil {
		t.Fatalf("计算请求失败: %v", err)
	}

	// 验证结果
	expectedResult := 150.0
	if resp.Msg.Result != expectedResult {
		t.Errorf("期望结果 %f, 但收到 %f", expectedResult, resp.Msg.Result)
	}
} 