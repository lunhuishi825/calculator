package service

import (
	"context"
	"testing"

	"github.com/bufbuild/connect-go"
	calculatorv1 "calculator/backend/gen/calculator/v1"
)

func TestCalculatorService_Calculate(t *testing.T) {
	// 创建测试用例
	tests := []struct {
		name           string
		leftOperand    float64
		rightOperand   float64
		operation      calculatorv1.Operation
		expectedResult float64
		expectedError  bool
		errorMessage   string
	}{
		{
			name:           "加法测试",
			leftOperand:    10,
			rightOperand:   5,
			operation:      calculatorv1.Operation_OPERATION_ADD,
			expectedResult: 15,
			expectedError:  false,
		},
		{
			name:           "减法测试",
			leftOperand:    10,
			rightOperand:   5,
			operation:      calculatorv1.Operation_OPERATION_SUBTRACT,
			expectedResult: 5,
			expectedError:  false,
		},
		{
			name:           "乘法测试",
			leftOperand:    10,
			rightOperand:   5,
			operation:      calculatorv1.Operation_OPERATION_MULTIPLY,
			expectedResult: 50,
			expectedError:  false,
		},
		{
			name:           "除法测试",
			leftOperand:    10,
			rightOperand:   5,
			operation:      calculatorv1.Operation_OPERATION_DIVIDE,
			expectedResult: 2,
			expectedError:  false,
		},
		{
			name:          "除以零测试",
			leftOperand:   10,
			rightOperand:  0,
			operation:     calculatorv1.Operation_OPERATION_DIVIDE,
			expectedError: true,
			errorMessage:  "除数不能为零",
		},
		{
			name:          "未指定操作测试",
			leftOperand:   10,
			rightOperand:  5,
			operation:     calculatorv1.Operation_OPERATION_UNSPECIFIED,
			expectedError: true,
		},
	}

	// 创建计算器服务实例
	service := NewCalculatorService()

	// 运行测试用例
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 创建请求
			req := connect.NewRequest(&calculatorv1.CalculateRequest{
				LeftOperand:  tt.leftOperand,
				RightOperand: tt.rightOperand,
				Operation:    tt.operation,
			})

			// 调用服务方法
			resp, err := service.Calculate(context.Background(), req)

			// 检查错误
			if tt.expectedError {
				if err == nil && resp.Msg.Error == "" {
					t.Errorf("期望错误但没有收到错误")
				}
				
				// 如果指定了错误消息，检查是否匹配
				if tt.errorMessage != "" && resp != nil && resp.Msg.Error != tt.errorMessage {
					t.Errorf("期望错误消息 '%s'，但收到 '%s'", tt.errorMessage, resp.Msg.Error)
				}
				return
			}

			// 如果不期望错误，但收到了错误
			if err != nil {
				t.Errorf("不期望错误但收到了错误: %v", err)
				return
			}

			// 检查结果
			if resp.Msg.Result != tt.expectedResult {
				t.Errorf("期望结果 %f，但收到 %f", tt.expectedResult, resp.Msg.Result)
			}
		})
	}
} 