package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/bufbuild/connect-go"
	"github.com/rs/cors"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	calculatorv1 "calculator/backend/gen/calculator/v1"
	"calculator/backend/gen/calculator/v1/calculatorv1connect"
)

const address = "localhost:8081"

// 计算器服务实现
type CalculatorServer struct{}

// 实现计算方法
func (s *CalculatorServer) Calculate(
	ctx context.Context,
	req *connect.Request[calculatorv1.CalculateRequest],
) (*connect.Response[calculatorv1.CalculateResponse], error) {
	// 获取请求中的操作数和操作符
	leftOperand := req.Msg.LeftOperand
	rightOperand := req.Msg.RightOperand
	operation := req.Msg.Operation

	var result float64

	// 根据操作类型执行相应的计算
	switch operation {
	case calculatorv1.Operation_OPERATION_ADD:
		result = leftOperand + rightOperand
	case calculatorv1.Operation_OPERATION_SUBTRACT:
		result = leftOperand - rightOperand
	case calculatorv1.Operation_OPERATION_MULTIPLY:
		result = leftOperand * rightOperand
	case calculatorv1.Operation_OPERATION_DIVIDE:
		if rightOperand == 0 {
			return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("除数不能为零"))
		}
		result = leftOperand / rightOperand
	default:
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("不支持的操作类型"))
	}

	// 返回计算结果
	response := connect.NewResponse(&calculatorv1.CalculateResponse{
		Result: result,
	})
	return response, nil
}

func main() {
	// 创建计算器服务实例
	calculator := &CalculatorServer{}
	
	// 创建计算器服务处理器
	path, handler := calculatorv1connect.NewCalculatorServiceHandler(calculator)

	// 设置CORS
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // 允许前端访问
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	// 创建路由
	mux := http.NewServeMux()
	mux.Handle(path, handler)

	// 使用CORS中间件包装路由
	handlerWithCors := corsMiddleware.Handler(mux)

	// 创建支持HTTP/2的服务器
	fmt.Printf("启动服务器，监听地址：%s\n", address)
	if err := http.ListenAndServe(
		address,
		h2c.NewHandler(handlerWithCors, &http2.Server{}),
	); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
} 