import React, { useState } from "react";
import client, { Operation } from "../lib/calculator_client";

const Calculator = () => {
  const [leftOperand, setLeftOperand] = useState<number>(0);
  const [rightOperand, setRightOperand] = useState<number>(0);
  const [operation, setOperation] = useState<Operation>(
    Operation.OPERATION_ADD
  );
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.calculate({
        leftOperand,
        rightOperand,
        operation,
      });

      if (response.error) {
        setError(response.error);
        setResult(null);
      } else {
        setResult(response.result);
      }
    } catch (err) {
      setError(`计算出错: ${err instanceof Error ? err.message : String(err)}`);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getOperationSymbol = (op: Operation): string => {
    switch (op) {
      case Operation.OPERATION_ADD:
        return "+";
      case Operation.OPERATION_SUBTRACT:
        return "-";
      case Operation.OPERATION_MULTIPLY:
        return "×";
      case Operation.OPERATION_DIVIDE:
        return "÷";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">计算器</h1>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="leftOperand"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            左操作数
          </label>
          <input
            id="leftOperand"
            type="number"
            value={leftOperand}
            onChange={(e) => setLeftOperand(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="左操作数"
            placeholder="输入左操作数"
          />
        </div>

        <div>
          <label
            htmlFor="operation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            操作
          </label>
          <select
            id="operation"
            value={operation}
            onChange={(e) => setOperation(Number(e.target.value) as Operation)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="选择操作"
            title="选择计算操作类型"
          >
            <option value={Operation.OPERATION_ADD}>加法 (+)</option>
            <option value={Operation.OPERATION_SUBTRACT}>减法 (-)</option>
            <option value={Operation.OPERATION_MULTIPLY}>乘法 (×)</option>
            <option value={Operation.OPERATION_DIVIDE}>除法 (÷)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="rightOperand"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            右操作数
          </label>
          <input
            id="rightOperand"
            type="number"
            value={rightOperand}
            onChange={(e) => setRightOperand(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="右操作数"
            placeholder="输入右操作数"
          />
        </div>

        <button
          onClick={handleCalculate}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "计算中..." : "计算"}
        </button>

        {result !== null && !error && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-lg font-medium text-center">
              {leftOperand} {getOperationSymbol(operation)} {rightOperand} ={" "}
              <span className="font-bold">{result}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
