package service

import (
	"context"
	"fmt"

	"github.com/bufbuild/connect-go"
	calculatorv1 "calculator/backend/gen/calculator/v1"
)

// CalculatorService 实现计算器服务
type CalculatorService struct{}

// NewCalculatorService 创建一个新的计算器服务实例
func NewCalculatorService() *CalculatorService {
	return &CalculatorService{}
}

// Calculate 处理计算请求
func (s *CalculatorService) Calculate(
	ctx context.Context,
	req *connect.Request[calculatorv1.CalculateRequest],
) (*connect.Response[calculatorv1.CalculateResponse], error) {
	input := req.Msg
	resp := &calculatorv1.CalculateResponse{}

	// 执行计算操作
	switch input.Operation {
	case calculatorv1.Operation_OPERATION_ADD:
		resp.Result = input.LeftOperand + input.RightOperand
	case calculatorv1.Operation_OPERATION_SUBTRACT:
		resp.Result = input.LeftOperand - input.RightOperand
	case calculatorv1.Operation_OPERATION_MULTIPLY:
		resp.Result = input.LeftOperand * input.RightOperand
	case calculatorv1.Operation_OPERATION_DIVIDE:
		if input.RightOperand == 0 {
			resp.Error = "除数不能为零"
			return connect.NewResponse(resp), nil
		}
		resp.Result = input.LeftOperand / input.RightOperand
	default:
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("不支持的操作类型: %v", input.Operation))
	}

	return connect.NewResponse(resp), nil
} 