#!/bin/bash

# 同步Proto文件脚本
# 此脚本将后端的Proto文件同步到前端，并重新生成代码

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

echo -e "${YELLOW}开始同步Proto文件...${NC}"

# 检查后端api目录是否存在
if [ ! -d "backend/api" ]; then
    echo -e "${RED}错误: 后端API目录不存在 (backend/api)${NC}"
    exit 1
fi

# 检查前端proto目录是否存在，不存在则创建
if [ ! -d "frontend/proto" ]; then
    echo -e "${YELLOW}创建前端Proto目录...${NC}"
    mkdir -p frontend/proto
fi

# 同步文件
echo -e "${YELLOW}从后端同步Proto文件到前端...${NC}"
cp -r backend/api/* frontend/proto/

# 检查同步是否成功
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 同步Proto文件失败${NC}"
    exit 1
fi

echo -e "${GREEN}Proto文件同步成功!${NC}"

# 重新生成后端代码
echo -e "${YELLOW}生成后端代码...${NC}"
cd backend && buf generate
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 生成后端代码失败${NC}"
    exit 1
fi
echo -e "${GREEN}后端代码生成成功!${NC}"

# 重新生成前端代码
echo -e "${YELLOW}生成前端代码...${NC}"
cd ../frontend && npx buf generate
if [ $? -ne 0 ]; then
    echo -e "${RED}错误: 生成前端代码失败${NC}"
    exit 1
fi
echo -e "${GREEN}前端代码生成成功!${NC}"

echo -e "${GREEN}同步和代码生成完成!${NC}" 