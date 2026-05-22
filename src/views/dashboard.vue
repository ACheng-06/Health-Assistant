<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div v-if="aiData.systemOverview" class="card-content">
            <div class="avatar users">
              <el-image style="width: 40px; height: 40px;" :src="iconUrl1" />
            </div>
            <div class="info">
              <p class="title">总用户数</p>
              <p class="number">{{ aiData.systemOverview.totalUsers }}</p>
              <p class="subtitle-title">活跃用户：{{ aiData.systemOverview.activeUsers }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar like">
              <el-image style="width: 40px; height: 40px;" :src="iconUrl2" />
            </div>
            <div class="info">
              <p class="title">情绪日志</p>
              <p class="number">{{ aiData.systemOverview.totalDiaries }}</p>
              <p class="subtitle-title">今日新增：{{ aiData.systemOverview.totalNewDiaries }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar comments">
              <el-image style="width: 40px; height: 40px;" :src="iconUrl3" />
            </div>
            <div class="info">
              <p class="title">咨询会话</p>
              <p class="number">{{ aiData.systemOverview.totalSessions }}</p>
              <p class="subtitle-title">今日新增：{{ aiData.systemOverview.totalNewSessions }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card v-if="aiData.systemOverview">
          <div class="card-content">
            <div class="avatar smile">
              <el-image style="width: 40px; height: 40px;" :src="iconUrl4" />
            </div>
            <div class="info">
              <p class="title">平均情绪</p>
              <p class="number">{{ aiData.systemOverview.avgMoodScore }}/10</p>
              <p class="subtitle-title">情绪健康指数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px;" :gutter="20">
      <el-col :span="12">
        <el-card style="width:100%">
          <template #header>
            <div class="card-header">
              情绪趋势分析
            </div>
          </template>
          <div class="chart-content">
            <div ref="emotionChartRef" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="width:100%">
          <template #header>
            <div class="card-header">
              咨询会话统计
            </div>
          </template>
          <div class="chart-content">
            <div class="consultation-stats" v-if="aiData.consultationStats">
              <div class="stat-item">
                <div class="stat-label">总会话数</div>
                <div class="stat-value">{{ aiData.consultationStats.totalSessions }}</div>
              </div>
              <div class="stat-item">
                <p class="title">平均时长</p>
                <p class="number">{{ aiData.consultationStats.avgDurationMinutes }}</p>
              </div>
              <div class="stat-item">
                <p class="title">活跃用户：</p>
                <p class="number">{{ aiData.systemOverview?.activeUsers }}</p>
              </div>
            </div>
            <div ref="consultationChartRef" style="width: 100%; height: 260px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px;">
      <el-card style="width: 100%;">
        <template #header>
          <div class="card-header">
            用户活跃度趋势
          </div>
        </template>
        <div class="chart-content">
          <div ref="userActivityChartRef" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </el-row>
  </div>
</template>
<script setup>
  import { getAnalyticsOverviewAPI } from '@/api/admin'
  import { onMounted, ref, nextTick } from 'vue'
  import * as echarts from 'echarts'

  //统计图片引入
  const iconUrl1 = new URL('@/assets/images/users.png', import.meta.url).href
  const iconUrl2 = new URL('@/assets/images/like.png', import.meta.url).href
  const iconUrl3 = new URL('@/assets/images/comments.png', import.meta.url).href
  const iconUrl4 = new URL('@/assets/images/smile.png', import.meta.url).href

  const aiData = ref({})

  // ---------------- 1. 情绪趋势图表 ----------------
  let emotionChart = null
  const emotionChartRef = ref(null)

  const initEmotional = () => {
    if (!emotionChartRef.value) return

    if (emotionChart) {
      emotionChart.dispose()
    }

    emotionChart = echarts.init(emotionChartRef.value)

    // 【核心修复 1】：把取数据的字段名改回你最初的 emotionChart，并加了 fallback 兼容
    const TrendData = aiData.value.emotionChart || aiData.value.emotionTrend || []

    const option = {
      title: {
        text: '情绪趋势分析',
        textStyle: { color: '#2d3436', fontSize: 16, fontWeight: 600 },
        left: 'center', top: 10
      },
      tooltip: {
        trigger: 'axis',
        borderColor: '#fab1a0',
        borderWidth: 1,
        textStyle: { color: '#2d3436' }
      },
      legend: {
        data: ['平均情绪评分', '记录数量'],
        top: 40
      },
      grid: { left: '3%', right: '4%', top: 80, bottom: '3%' },
      xAxis: {
        type: 'category',
        data: TrendData.map(item => item.date),
        axisLine: { lineStyle: { color: '#2d3436' } }
      },
      yAxis: [{
        type: 'value', name: '情绪评分', position: 'left',
        axisLine: { lineStyle: { color: '#2d3436' } }
      }, {
        type: 'value', name: '记录数量', position: 'right',
        axisLine: { lineStyle: { color: '#2d3436' } }
      }],
      series: [{
        name: '平均情绪评分', type: 'line', smooth: true,
        data: TrendData.map(item => item.avgMoodScore),
        lineStyle: { width: 3, color: '#faebaf' },
        itemStyle: { color: '#faebaf' }
      }, {
        name: '记录数量', type: 'line', smooth: true,
        yAxisIndex: 1, // 【核心修复 2】：这里必须加上 1，告诉 Echarts 绑定到右边的 Y 轴
        data: TrendData.map(item => item.recordCount),
        lineStyle: { width: 3, color: '#eeb5a3' },
        itemStyle: { color: '#eeb5a3' }
      }]
    }

    emotionChart.setOption(option)
  }

  // ---------------- 2. 咨询会话统计图表 ----------------
  // 【修复核心1】：之前这里重复声明了 emotionChart，现改为 consultationChart
  let consultationChart = null
  const consultationChartRef = ref(null)

  const initConsultationChart = () => {
    if (!consultationChartRef.value) return
    if (consultationChart) {
      consultationChart.dispose() // 【修复核心2】：加上了小括号 ()
    }

    consultationChart = echarts.init(consultationChartRef.value)

    // 【修复核心3】：从响应式对象中取值要带 .value，并且加上安全问号防报错
    const dailyTrend = aiData.value.consultationStats?.dailyTrend || []

    const option = {
      title: {
        text: '咨询活动统计',
        textStyle: { fontSize: 16, fontWeight: 600, color: '#2d3436' },
        left: 'center', top: 10
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#fab1a0', borderWidth: 1,
        textStyle: { color: '#2d3436' }
      },
      legend: {
        data: ['会话数量', '参与用户数'],
        top: 40, textStyle: { color: '#636e72' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: 80, containLabel: true },
      xAxis: {
        type: 'category',
        data: dailyTrend.map(item => item.date),
        axisLine: { lineStyle: { color: 'rgba(244, 162, 97, 0.3)' } },
        axisLabel: { color: '#636e72' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#636e72' },
        axisLine: { lineStyle: { color: 'rgba(244, 162, 97, 0.3)' } },
        splitLine: { lineStyle: { color: 'rgba(244, 162, 97, 0.1)' } }
      },
      series: [
        {
          name: '会话数量', type: 'bar', barWidth: '40%',
          data: dailyTrend.map(item => item.sessionCount),
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: '#74b9ff' }, { offset: 1, color: '#0984e3' }]
            }
          }
        },
        {
          name: '参与用户数', type: 'bar', barWidth: '40%',
          data: dailyTrend.map(item => item.userCount),
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: '#fdcb6e' }, { offset: 1, color: '#f39c12' }]
            }
          }
        }
      ]
    }
    consultationChart.setOption(option)
  }
  // ---------------- 3. 用户活跃度趋势 ----------------
  let userActivityChart = null  // ✅ 这个用来存图表实例
  const userActivityChartRef = ref(null) // ✅ 这个用来绑定 HTML 里的 <div ref="userActivityChartRef">
  const initUserActivityChart = () => {
    // ✅ 修改后：
    if (userActivityChart) {
      userActivityChart.dispose()
    }
    // 创建echarts实例，赋值给 userActivityChart
    userActivityChart = echarts.init(userActivityChartRef.value)
    //获取数据
    // ✅ 修改后：
    const activityData = aiData.value.userActivity || []
    const option = {
      title: {
        text: '用户活跃度趋势',
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#2d3436'
        },
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#fab1a0',
        borderWidth: 1,
        textStyle: {
          color: '#2d3436'
        }
      },
      legend: {
        data: ['活跃用户', '新增用户', '日记用户', '咨询用户'],
        top: 40,
        textStyle: {
          color: '#636e72'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 80,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: activityData.map(item => item.date),
        axisLine: {
          lineStyle: {
            color: 'rgba(244, 162, 97, 0.3)'
          }
        },
        axisLabel: {
          color: '#636e72'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#636e72'
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(244, 162, 97, 0.3)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(244, 162, 97, 0.1)'
          }
        }
      },
      series: [
        {
          name: '活跃用户',
          type: 'line',
          data: activityData.map(item => item.activeUsers),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#a29bfe'
          },
          itemStyle: {
            color: '#a29bfe'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(162, 155, 254, 0.4)' },
                { offset: 1, color: 'rgba(162, 155, 254, 0.1)' }
              ]
            }
          }
        },
        {
          name: '新增用户',
          type: 'line',
          data: activityData.map(item => item.newUsers),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#fdcb6e'
          },
          itemStyle: {
            color: '#fdcb6e'
          }
        },
        {
          name: '日记用户',
          type: 'line',
          data: activityData.map(item => item.diaryUsers),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#00b894'
          },
          itemStyle: {
            color: '#00b894'
          }
        },
        {
          name: '咨询用户',
          type: 'line',
          data: activityData.map(item => item.consultationUsers),
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#fab1a0'
          },
          itemStyle: {
            color: '#fab1a0'
          }
        }
      ]
    }
    userActivityChart.setOption(option)
  }

  onMounted(async () => {
    try {
      const res = await getAnalyticsOverviewAPI()
      aiData.value = (res.data && res.data.data) || res.data || res || {}

      nextTick(() => {
        initEmotional()
        initConsultationChart()
        initUserActivityChart()

        // 监听窗口大小改变，使三个图表都自动适应宽度
        window.addEventListener('resize', () => {
          if (emotionChart) emotionChart.resize()
          if (consultationChart) consultationChart.resize()
          if (userActivityChart) userActivityChart.resize()
        })
      })
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
    }
  })
</script>
<style lang="scss">
.dashboard-container {
  .card-content {
    display: flex;
    align-items: center;

    .avatar {
      margin-right: 12px;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.users {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.like {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.comments {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.smile {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }

    .info {
      .title {
        font-size: 14px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }

      .value {
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 4px
      }

      .subtitle-title {
        font-size: 12px;
        color: #95a5a6;
      }
    }
  }

  .chart-content {
    padding: 20px;
    height: 300px;
    position: relative;

    canvas {
      width: 100% !important;
      height: 100% !important;
    }

    .consultation-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: 12px;
          color: #7f8c8d;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }
      }
    }
  }
}
</style>
