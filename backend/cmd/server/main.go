package main

import (
	"fmt"
	"log"
	"net/http"
	"github.com/rs/cors"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	"calculator/backend/gen/calculator/v1/calculatorv1connect"
	"calculator/backend/internal/service"
)

const address = "localhost:8081"

func main() {
	// 创建计算器服务实例
	calculator := service.NewCalculatorService()
	
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