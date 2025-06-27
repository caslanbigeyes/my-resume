'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Plus, Download, Copy, Trash2, Move, Square, Circle, Diamond } from 'lucide-react'

interface FlowNode {
  id: string
  type: 'start' | 'process' | 'decision' | 'end'
  text: string
  x: number
  y: number
  width: number
  height: number
}

interface FlowConnection {
  id: string
  from: string
  to: string
  label?: string
}

interface FlowChart {
  nodes: FlowNode[]
  connections: FlowConnection[]
}

/**
 * 流程图制作器组件
 * 创建和编辑流程图
 */
export default function FlowchartMakerPage() {
  const [flowChart, setFlowChart] = useState<FlowChart>({
    nodes: [],
    connections: []
  })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // 节点类型配置
  const nodeTypes = [
    { type: 'start', label: '开始', icon: Circle, color: '#10B981' },
    { type: 'process', label: '处理', icon: Square, color: '#3B82F6' },
    { type: 'decision', label: '判断', icon: Diamond, color: '#F59E0B' },
    { type: 'end', label: '结束', icon: Circle, color: '#EF4444' }
  ]

  // 添加节点
  const addNode = useCallback((type: FlowNode['type']) => {
    const newNode: FlowNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: type === 'start' ? '开始' : type === 'end' ? '结束' : type === 'decision' ? '判断条件' : '处理步骤',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'decision' ? 120 : 100,
      height: type === 'decision' ? 80 : 60
    }

    setFlowChart(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
  }, [])

  // 删除节点
  const deleteNode = useCallback((nodeId: string) => {
    setFlowChart(prev => ({
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId)
    }))
    setSelectedNode(null)
  }, [])

  // 更新节点文本
  const updateNodeText = useCallback((nodeId: string, text: string) => {
    setFlowChart(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, text } : node
      )
    }))
  }, [])

  // 开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (isConnecting) {
      if (connectionStart === null) {
        setConnectionStart(nodeId)
      } else if (connectionStart !== nodeId) {
        // 创建连接
        const newConnection: FlowConnection = {
          id: Math.random().toString(36).substr(2, 9),
          from: connectionStart,
          to: nodeId
        }
        setFlowChart(prev => ({
          ...prev,
          connections: [...prev.connections, newConnection]
        }))
        setConnectionStart(null)
        setIsConnecting(false)
      }
      return
    }

    const node = flowChart.nodes.find(n => n.id === nodeId)
    if (!node) return

    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    })
    setDraggedNode(nodeId)
    setSelectedNode(nodeId)
  }, [isConnecting, connectionStart, flowChart.nodes])

  // 拖拽移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    setFlowChart(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === draggedNode 
          ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) }
          : node
      )
    }))
  }, [draggedNode, dragOffset])

  // 结束拖拽
  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
  }, [])

  // 渲染节点
  const renderNode = useCallback((node: FlowNode) => {
    const nodeType = nodeTypes.find(t => t.type === node.type)
    const isSelected = selectedNode === node.id

    if (node.type === 'decision') {
      // 菱形
      const centerX = node.x + node.width / 2
      const centerY = node.y + node.height / 2
      const points = `${centerX},${node.y} ${node.x + node.width},${centerY} ${centerX},${node.y + node.height} ${node.x},${centerY}`
      
      return (
        <g key={node.id}>
          <polygon
            points={points}
            fill={nodeType?.color}
            stroke={isSelected ? '#1F2937' : '#6B7280'}
            strokeWidth={isSelected ? 3 : 1}
            className="cursor-pointer"
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            className="pointer-events-none select-none"
          >
            {node.text.length > 8 ? node.text.substring(0, 8) + '...' : node.text}
          </text>
        </g>
      )
    } else if (node.type === 'start' || node.type === 'end') {
      // 圆形
      const centerX = node.x + node.width / 2
      const centerY = node.y + node.height / 2
      const radius = Math.min(node.width, node.height) / 2
      
      return (
        <g key={node.id}>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill={nodeType?.color}
            stroke={isSelected ? '#1F2937' : '#6B7280'}
            strokeWidth={isSelected ? 3 : 1}
            className="cursor-pointer"
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            className="pointer-events-none select-none"
          >
            {node.text.length > 6 ? node.text.substring(0, 6) + '...' : node.text}
          </text>
        </g>
      )
    } else {
      // 矩形
      return (
        <g key={node.id}>
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            fill={nodeType?.color}
            stroke={isSelected ? '#1F2937' : '#6B7280'}
            strokeWidth={isSelected ? 3 : 1}
            rx="4"
            className="cursor-pointer"
            onMouseDown={(e) => handleMouseDown(e, node.id)}
          />
          <text
            x={node.x + node.width / 2}
            y={node.y + node.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            className="pointer-events-none select-none"
          >
            {node.text.length > 8 ? node.text.substring(0, 8) + '...' : node.text}
          </text>
        </g>
      )
    }
  }, [selectedNode, handleMouseDown, nodeTypes])

  // 渲染连接线
  const renderConnection = useCallback((connection: FlowConnection) => {
    const fromNode = flowChart.nodes.find(n => n.id === connection.from)
    const toNode = flowChart.nodes.find(n => n.id === connection.to)
    
    if (!fromNode || !toNode) return null

    const fromX = fromNode.x + fromNode.width / 2
    const fromY = fromNode.y + fromNode.height / 2
    const toX = toNode.x + toNode.width / 2
    const toY = toNode.y + toNode.height / 2

    // 计算箭头
    const angle = Math.atan2(toY - fromY, toX - fromX)
    const arrowLength = 10
    const arrowAngle = Math.PI / 6

    const arrowX1 = toX - arrowLength * Math.cos(angle - arrowAngle)
    const arrowY1 = toY - arrowLength * Math.sin(angle - arrowAngle)
    const arrowX2 = toX - arrowLength * Math.cos(angle + arrowAngle)
    const arrowY2 = toY - arrowLength * Math.sin(angle + arrowAngle)

    return (
      <g key={connection.id}>
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="#6B7280"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <polygon
          points={`${toX},${toY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
          fill="#6B7280"
        />
      </g>
    )
  }, [flowChart.nodes])

  // 导出 SVG
  const exportSVG = useCallback(() => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowchart.svg'
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  // 复制为文本
  const copyAsText = useCallback(() => {
    const textRepresentation = flowChart.nodes.map(node => {
      const connections = flowChart.connections.filter(conn => conn.from === node.id)
      const connectedTo = connections.map(conn => {
        const targetNode = flowChart.nodes.find(n => n.id === conn.to)
        return targetNode ? targetNode.text : ''
      }).filter(Boolean)
      
      return `${node.text}${connectedTo.length > 0 ? ' → ' + connectedTo.join(', ') : ''}`
    }).join('\n')

    navigator.clipboard.writeText(textRepresentation)
  }, [flowChart])

  // 清空画布
  const clearCanvas = useCallback(() => {
    setFlowChart({ nodes: [], connections: [] })
    setSelectedNode(null)
  }, [])

  // 加载示例
  const loadExample = useCallback(() => {
    const exampleChart: FlowChart = {
      nodes: [
        { id: '1', type: 'start', text: '开始', x: 200, y: 50, width: 80, height: 60 },
        { id: '2', type: 'process', text: '输入数据', x: 180, y: 150, width: 120, height: 60 },
        { id: '3', type: 'decision', text: '数据有效?', x: 170, y: 250, width: 140, height: 80 },
        { id: '4', type: 'process', text: '处理数据', x: 80, y: 380, width: 120, height: 60 },
        { id: '5', type: 'process', text: '显示错误', x: 280, y: 380, width: 120, height: 60 },
        { id: '6', type: 'end', text: '结束', x: 200, y: 500, width: 80, height: 60 }
      ],
      connections: [
        { id: 'c1', from: '1', to: '2' },
        { id: 'c2', from: '2', to: '3' },
        { id: 'c3', from: '3', to: '4' },
        { id: 'c4', from: '3', to: '5' },
        { id: 'c5', from: '4', to: '6' },
        { id: 'c6', from: '5', to: '6' }
      ]
    }
    setFlowChart(exampleChart)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            📊 流程图制作器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            创建和编辑流程图，可视化业务流程
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：工具面板 */}
          <div className="space-y-6">
            {/* 节点工具 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">添加节点</h3>
              <div className="space-y-2">
                {nodeTypes.map(nodeType => {
                  const Icon = nodeType.icon
                  return (
                    <button
                      key={nodeType.type}
                      onClick={() => addNode(nodeType.type as FlowNode['type'])}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Icon className="w-5 h-5" style={{ color: nodeType.color }} />
                      <span className="text-gray-900 dark:text-gray-100">{nodeType.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 连接工具 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">连接工具</h3>
              <button
                onClick={() => {
                  setIsConnecting(!isConnecting)
                  setConnectionStart(null)
                }}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  isConnecting 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isConnecting ? '取消连接' : '连接节点'}
              </button>
              {isConnecting && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  点击两个节点来创建连接
                </p>
              )}
            </div>

            {/* 节点编辑 */}
            {selectedNode && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">编辑节点</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      节点文本
                    </label>
                    <input
                      type="text"
                      value={flowChart.nodes.find(n => n.id === selectedNode)?.text || ''}
                      onChange={(e) => updateNodeText(selectedNode, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => deleteNode(selectedNode)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除节点
                  </button>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">操作</h3>
              <div className="space-y-2">
                <button
                  onClick={loadExample}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  加载示例
                </button>
                <button
                  onClick={exportSVG}
                  disabled={flowChart.nodes.length === 0}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出 SVG
                </button>
                <button
                  onClick={copyAsText}
                  disabled={flowChart.nodes.length === 0}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  复制文本
                </button>
                <button
                  onClick={clearCanvas}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  清空画布
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：画布 */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">流程图画布</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  节点: {flowChart.nodes.length} | 连接: {flowChart.connections.length}
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                <svg
                  ref={svgRef}
                  width="100%"
                  height="600"
                  className="bg-gray-50 dark:bg-gray-900"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#6B7280"
                      />
                    </marker>
                  </defs>
                  
                  {/* 渲染连接线 */}
                  {flowChart.connections.map(renderConnection)}
                  
                  {/* 渲染节点 */}
                  {flowChart.nodes.map(renderNode)}
                </svg>
              </div>
              
              {flowChart.nodes.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  点击左侧按钮添加节点开始创建流程图
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">基本操作</h4>
              <ul className="space-y-1">
                <li>• 点击左侧按钮添加不同类型的节点</li>
                <li>• 拖拽节点可以移动位置</li>
                <li>• 点击节点可以选中并编辑</li>
                <li>• 使用连接工具创建节点间的连接</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">节点类型</h4>
              <ul className="space-y-1">
                <li>• <span className="text-green-600">开始</span>: 流程的起始点</li>
                <li>• <span className="text-blue-600">处理</span>: 处理步骤或操作</li>
                <li>• <span className="text-yellow-600">判断</span>: 决策或条件判断</li>
                <li>• <span className="text-red-600">结束</span>: 流程的结束点</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
