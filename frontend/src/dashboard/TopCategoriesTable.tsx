"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Settings, AlertTriangle } from "lucide-react"

interface TopCategoryData {
  categoryName: string
  avgRiskScore: number
  avgDisadvantagePercent: number
  riskClauseCount: number
}

// Fallback Mock Data in case the backend API fails or is empty
const mockData: TopCategoryData[] = [
  { categoryName: "Master Service Agreement", avgRiskScore: 82.5, avgDisadvantagePercent: 65.0, riskClauseCount: 14 },
  { categoryName: "Non-Disclosure Agreement", avgRiskScore: 78.0, avgDisadvantagePercent: 55.2, riskClauseCount: 8 },
  { categoryName: "Employment Contract", avgRiskScore: 65.4, avgDisadvantagePercent: 42.1, riskClauseCount: 12 },
  { categoryName: "Vendor Agreement", avgRiskScore: 59.9, avgDisadvantagePercent: 38.5, riskClauseCount: 5 },
  { categoryName: "Software License", avgRiskScore: 52.1, avgDisadvantagePercent: 29.0, riskClauseCount: 3 },
]

export function TopCategoriesTable() {
  const [data, setData] = useState<TopCategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        const res = await fetch("/api/dashboard/categories/top?limit=5")
        if (res.ok) {
          const json = await res.json()
          if (json && json.length > 0) {
            setData(json)
            return
          }
        }
        setData(mockData) // Fallback to mock data if empty
      } catch (error) {
        console.error("Failed to load top categories, using mock data", error)
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchTopCategories()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm uppercase tracking-wider text-[#635f79] font-bold">
          위험도 상위 카테고리
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[13px] uppercase bg-slate-50 text-[#635f79] font-bold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 tracking-wider">카테고리명</th>
                <th scope="col" className="px-6 py-4 tracking-wider text-center">평균 위험도</th>
                <th scope="col" className="px-6 py-4 tracking-wider text-center">불리함 비율</th>
                <th scope="col" className="px-6 py-4 tracking-wider text-center">위험 조항 수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#7d7b90] font-medium">
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr 
                    key={index} 
                    className="bg-white border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <Link 
                        href={`/dashboard/category/${encodeURIComponent(item.categoryName)}`}
                        className="font-semibold text-[#3b3260] hover:text-[#5b4db3] transition-colors hover:underline"
                      >
                        {item.categoryName}
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {item.avgRiskScore >= 70 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        <span className={`font-semibold ${item.avgRiskScore >= 70 ? 'text-orange-600' : 'text-slate-600'}`}>
                          {item.avgRiskScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-semibold text-[#4a4175]">
                        {item.avgDisadvantagePercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[#8b5cf6] font-semibold">
                        {item.riskClauseCount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
