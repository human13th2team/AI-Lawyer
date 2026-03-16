"use client"

import React, { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Mock Data: Recent 14 days representing timestamps grouping
const rawDailyData = [
  { date: "03.03", Total: 3, SaaS: 2, NDA: 1, Employment: 0, Vendor: 0 },
  { date: "03.04", Total: 5, SaaS: 2, NDA: 2, Employment: 1, Vendor: 0 },
  { date: "03.05", Total: 8, SaaS: 4, NDA: 2, Employment: 1, Vendor: 1 },
  { date: "03.06", Total: 4, SaaS: 1, NDA: 3, Employment: 0, Vendor: 0 },
  { date: "03.07", Total: 9, SaaS: 5, NDA: 2, Employment: 2, Vendor: 0 },
  { date: "03.08", Total: 12, SaaS: 6, NDA: 3, Employment: 2, Vendor: 1 },
  { date: "03.09", Total: 7, SaaS: 3, NDA: 2, Employment: 2, Vendor: 0 },
  { date: "03.10", Total: 10, SaaS: 4, NDA: 4, Employment: 1, Vendor: 1 },
  { date: "03.11", Total: 15, SaaS: 8, NDA: 3, Employment: 2, Vendor: 2 },
  { date: "03.12", Total: 11, SaaS: 5, NDA: 4, Employment: 1, Vendor: 1 },
  { date: "03.13", Total: 18, SaaS: 9, NDA: 5, Employment: 3, Vendor: 1 },
  { date: "03.14", Total: 14, SaaS: 7, NDA: 4, Employment: 2, Vendor: 1 },
  { date: "03.15", Total: 8, SaaS: 3, NDA: 3, Employment: 1, Vendor: 1 },
  { date: "03.16", Total: 5, SaaS: 2, NDA: 2, Employment: 1, Vendor: 0 }, // Today
]

const initialCategories = ["Total", "SaaS", "NDA", "Employment", "Vendor"]
const initialCategoryLabels: Record<string, string> = {
  Total: "전체 기록",
  SaaS: "SaaS 약관",
  NDA: "기밀유지(NDA)",
  Employment: "고용/근로 계약",
  Vendor: "벤더 계약"
}

export function DailyCategoryTrendChart() {
  const [data, setData] = useState<any[]>(rawDailyData)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Total")
  
  const [categories, setCategories] = useState(initialCategories)
  const [categoryLabels, setCategoryLabels] = useState(initialCategoryLabels)

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/dashboard/contracts/daily")
        if (res.ok) {
          const json = await res.json()
          if (json && json.length > 0) {
            setData(json)
            // Extract dynamic categories from JSON
            // Total has to be first
            const fieldsStats = new Map<string, number>()
            json.forEach((day: any) => {
              Object.keys(day).forEach(key => {
                if (key !== "date" && key !== "Total" && typeof day[key] === "number") {
                  fieldsStats.set(key, (fieldsStats.get(key) || 0) + day[key])
                }
              })
            })
            // Sort categories by total across 14 days
            const dynamicCategories = Array.from(fieldsStats.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4) // top 4 categories
              .map(entry => entry[0])

            const activeCategories = ["Total", ...dynamicCategories]
            setCategories(activeCategories)
            
            // Build Labels
            const dynamicLabels: Record<string, string> = { Total: "전체 기록" }
            dynamicCategories.forEach(cat => {
              dynamicLabels[cat] = cat.length > 12 ? cat.substring(0, 10) + ".." : cat
            })
            setCategoryLabels(dynamicLabels)
            return
          }
        }
      } catch (e) {
        console.error("Failed to fetch daily trend, using mock instead", e)
      } finally {
        setLoading(false)
      }
    }
    fetchRealData()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-6 space-y-4 md:space-y-0">
        <div>
          <CardTitle className="text-sm uppercase tracking-wider text-[#635f79] font-bold">
            일자별 분석 트렌드
          </CardTitle>
          <p className="text-[12px] text-[#7d7b90] mt-1 font-medium">최근 14일간 지정된 카테고리의 일일 분석 건수</p>
        </div>
        
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors duration-200 ${
                selectedCategory === cat 
                  ? "bg-[#6d28d9] text-white shadow-sm" 
                  : "bg-slate-100 text-[#635f79] hover:bg-slate-200"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-6">
        <div className="h-[320px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#7d7b90] font-medium">
              데이터를 불러오는 중입니다...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6d28d9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#7d7b90", fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                  tickMargin={10}
                  minTickGap={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#7d7b90", fontSize: 12, fontWeight: 600 }}
                  allowDecimals={false} // Force integers (0, 1, 2, 3...)
                />
                <Tooltip 
                  cursor={{ stroke: '#c4b5fd', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "none", 
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                    color: "#2f2054",
                    fontSize: "13px"
                  }}
                  itemStyle={{ color: "#6d28d9", fontWeight: "bold" }}
                  formatter={(value: any) => [`${value}건`, categoryLabels[selectedCategory]]}
                  labelStyle={{ color: "#7d7b90", marginBottom: "4px" }}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedCategory} 
                  stroke="#6d28d9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrimary)" 
                  activeDot={{ r: 6, fill: "#6d28d9", stroke: "#fff", strokeWidth: 2 }}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
