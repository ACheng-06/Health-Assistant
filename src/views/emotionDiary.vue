<template>
  <div class="emotionDiary-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="iconUrl" style="width: 60px; height: 60px"></el-image>
        <h1>情绪日志</h1>
      </div>
    </div>

    <div class="content">
      <el-form ref="formRef" :model="diaryForm" :rules="rules" label-position="top">
        <!-- 情绪评分 -->
        <div class="diary-card">
          <div class="title">今日情绪评分</div>
          <div class="section">
            <p>您今天的整体情绪状态如何？(1-10分)</p>
            <el-form-item prop="moodScore">
              <div class="rate">
                <el-rate v-model="diaryForm.moodScore" :texts="emotionStatus" show-text :max="10" size="large" />
              </div>
            </el-form-item>
          </div>
        </div>

        <!-- 主要情绪 -->
        <div class="diary-card">
          <div class="title">主要情绪</div>
          <el-form-item prop="dominantEmotion">
            <div class="emotion-grid">
              <div v-for="emotion in emotionOptions" :key="emotion.name" class="emotion-card"
                :class="{ 'selected': emotion.name === diaryForm.dominantEmotion }"
                @click="selectEmotion(emotion.name)">
                <el-image :src="emotion.url" style="width: 50px; height: 50px"></el-image>
                <div class="emotion-name">{{ emotion.name }}</div>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 详情记录 -->
        <div class="diary-card">
          <div class="title">详细记录</div>
          <div class="detail-form">
            <el-form-item label="主要情绪触发因素" prop="emotionTriggers">
              <el-input v-model="diaryForm.emotionTriggers" placeholder="今天什么事情导致了你的主要情绪？" type="textarea" :rows="3"
                maxLength="1000" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="今日感想" prop="diaryContent">
              <el-input v-model="diaryForm.diaryContent" placeholder="写下您今天的想法，感受或发生的事情..." type="textarea" :rows="5"
                maxLength="2000" show-word-limit></el-input>
            </el-form-item>

            <!-- 生活指标 -->
            <div class="life-indicators">
              <div class="indicator-group">
                <el-form-item label="睡眠质量" prop="sleepQuality">
                  <el-select v-model="diaryForm.sleepQuality" placeholder="请选择睡眠质量" style="width: 100%">
                    <el-option label="很差" value="1"></el-option>
                    <el-option label="较差" value="2"></el-option>
                    <el-option label="一般" value="3"></el-option>
                    <el-option label="良好" value="4"></el-option>
                    <el-option label="优秀" value="5"></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="indicator-group">
                <el-form-item label="压力水平" prop="stressLevel">
                  <el-select v-model="diaryForm.stressLevel" placeholder="请选择压力水平" style="width: 100%">
                    <el-option label="很低" value="1"></el-option>
                    <el-option label="较低" value="2"></el-option>
                    <el-option label="中等" value="3"></el-option>
                    <el-option label="较高" value="4"></el-option>
                    <el-option label="很高" value="5"></el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>

            <div class="action-buttons">
              <el-button @click="resetForm">重置</el-button>
              <el-button type="primary" @click="submit">提交</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </div>




  </div>


</template>
<script setup>

  import { dayjs, ElMessage } from 'element-plus'
  import { ref, reactive } from 'vue'
  import { addEmotionDiaryAPI } from '@/api/frontend'

  //情绪评分
  const emotionStatus = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福']

  const iconUrl = new URL('@/assets/images/like.png', import.meta.url).href
  //情绪选项
  const emotionOptions = [
    { name: '开心', url: new URL('@/assets/images/开心.png', import.meta.url).href },
    { name: '平静', url: new URL('@/assets/images/平静.png', import.meta.url).href },
    { name: '焦虑', url: new URL('@/assets/images/焦虑.png', import.meta.url).href },
    { name: '悲伤', url: new URL('@/assets/images/悲伤.png', import.meta.url).href },
    { name: '兴奋', url: new URL('@/assets/images/兴奋.png', import.meta.url).href },
    { name: '疲惫', url: new URL('@/assets/images/疲惫.png', import.meta.url).href },
    { name: '惊讶', url: new URL('@/assets/images/惊讶.png', import.meta.url).href },
    { name: '困惑', url: new URL('@/assets/images/困惑.png', import.meta.url).href },
  ]

  // 表单引用
  const formRef = ref(null)

  const diaryForm = reactive({
    diaryDate: dayjs().format('YYYY-MM-DD'),
    moodScore: null,
    dominantEmotion: '',
    emotionTriggers: '',
    diaryContent: '',
    sleepQuality: null,
    stressLevel: null
  })

  // 表单校验规则
  const rules = {
    moodScore: [{ required: true, message: '请选择情绪评分', trigger: 'change' }],
    dominantEmotion: [{ required: true, message: '请选择主要情绪', trigger: 'change' }],
    sleepQuality: [{ required: true, message: '请选择睡眠质量', trigger: 'change' }],
    stressLevel: [{ required: true, message: '请选择压力水平', trigger: 'change' }]
  }

  //重置表单
  const resetForm = () => {
    formRef.value.resetFields()
    Object.assign(diaryForm, {
      moodScore: null,
      dominantEmotion: '',
      emotionTriggers: '',
      diaryContent: '',
      sleepQuality: null,
      stressLevel: null
    })
  }

  //选择主要情绪
  const selectEmotion = (emotion) => {
    diaryForm.dominantEmotion = emotion
  }

  //提交逻辑
  const submit = async () => {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    try {
      await addEmotionDiaryAPI(diaryForm)
      ElMessage.success('提交成功')
      resetForm()
    } catch (error) {
      ElMessage.error('提交失败，请重试')
    }
  }

</script>

<style lang="scss" scoped>
.emotionDiary-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .header-section {
    background: linear-gradient(135deg, #95efd8 0%, #849be9 100%);
    color: white;
    padding: 48px;
    border-radius: 20px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .content {
    margin: 0 auto;
    width: 980px;
    padding: 20px;

    .diary-card {
      margin-bottom: 20px;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(185, 184, 184, 0.8);

      .title {
        margin-bottom: 20px;
        font-size: 25px;
        font-weight: 600;
        color: #374151;
      }

      .section {
        margin-bottom: 20px;

        p {
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 15px;
        }

        .el-form-item {
          margin-bottom: 0;
        }
      }

      .el-form-item {
        margin-bottom: 0;
      }

      .emotion-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .emotion-card {
          padding: 15px;
          border: 2px solid #E5E7EB;
          border-radius: 15px;
          text-align: center;
          cursor: pointer;
          background: #F9FAFB;
          /* 增加了一点过渡动画让点击显得更流畅 */
          transition: all 0.2s ease;

          .emotion-name {
            margin-top: 10px;
            padding: 0 75px;
            color: #374151;
          }

          &.selected {
            border-color: #7ED321;
            background: #F0FDF4;
            transform: translateY(-3px);
          }
        }
      }

      .detail-form {
        .el-form-item {
          margin-bottom: 20px;
        }

        .el-form-item__label {
          color: #374151;
          font-weight: 500;
        }

        .life-indicators {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;

          .indicator-group {
            flex: 1;
          }
        }

        /* 修复了底部按钮容器样式 */
        .action-buttons {
          margin-top: 40px;
          display: flex;
          justify-content: flex-end;
          /* 按钮居右，如果你想居中可以改成 center */
          gap: 15px;
        }
      }
    }
  }
}
</style>