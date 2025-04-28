# 同步Proto文件脚本 (PowerShell版)
# 此脚本将后端的Proto文件同步到前端，并重新生成代码

Write-Host "开始同步Proto文件..." -ForegroundColor Yellow

# 检查后端api目录是否存在
if (-not (Test-Path "backend\api")) {
    Write-Host "错误: 后端API目录不存在 (backend\api)" -ForegroundColor Red
    exit 1
}

# 检查前端proto目录是否存在，不存在则创建
if (-not (Test-Path "frontend\proto")) {
    Write-Host "创建前端Proto目录..." -ForegroundColor Yellow
    New-Item -Path "frontend\proto" -ItemType Directory -Force | Out-Null
}

# 同步文件
Write-Host "从后端同步Proto文件到前端..." -ForegroundColor Yellow
Copy-Item -Path "backend\api\*" -Destination "frontend\proto\" -Recurse -Force

# 检查同步是否成功
if (-not $?) {
    Write-Host "错误: 同步Proto文件失败" -ForegroundColor Red
    exit 1
}

Write-Host "Proto文件同步成功!" -ForegroundColor Green

# 重新生成后端代码
Write-Host "生成后端代码..." -ForegroundColor Yellow
Push-Location -Path "backend"
buf generate
if (-not $?) {
    Write-Host "错误: 生成后端代码失败" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "后端代码生成成功!" -ForegroundColor Green

# 重新生成前端代码
Write-Host "生成前端代码..." -ForegroundColor Yellow
Push-Location -Path "frontend"
npx buf generate
if (-not $?) {
    Write-Host "错误: 生成前端代码失败" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "前端代码生成成功!" -ForegroundColor Green

Write-Host "同步和代码生成完成!" -ForegroundColor Green 