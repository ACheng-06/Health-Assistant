<template>
  <div class="home-container">
    <!-- 背景装饰圆 -->
    <div class="bg-circle bg-circle-1"></div>
    <div class="bg-circle bg-circle-2"></div>
    <div class="bg-circle bg-circle-3"></div>

    <div class="content">
      <div class="text">
        <h2 class="title">
          一次温暖的对话<br />
          <span class="highlight-text">化孤独为慰籍</span>
        </h2>
        <p class="description">每个深夜，每个焦虑的时刻，我们都在这里，不必独自承受，让心与心的连接温暖您的每一天</p>
        <div class="hero-actions">
          <el-button size="large" class="btn-primary" @click="goToConsultation">开始倾述，获得陪伴</el-button>
          <el-button size="large" class="btn-outline" @click="goToEmotionDiary">记录心情，释放情感</el-button>
        </div>
      </div>
      <div class="robot-wrapper">
        <div class="robot-glow"></div>
        <div class="robot">
          <el-image style="width: 150px; height: 150px" :src="iconUrl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const iconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href

  // 跳转到咨询页面
  const goToConsultation = () => {
    router.push('/consultation')
  }

  // 跳转到情绪日志页面
  const goToEmotionDiary = () => {
    router.push('/emotion-diary')
  }
</script>

<style scoped lang="scss">
.home-container {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  margin-top: -20px;
  margin-bottom: -20px;
  min-height: calc(100vh - 131px);
  background: linear-gradient(135deg, rgb(131, 96, 195), rgb(46, 191, 145));
  color: white;
  padding: 5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  /* 背景装饰圆 */
  .bg-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;
    pointer-events: none;
  }

  .bg-circle-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #8192f2, transparent 70%);
    top: -150px;
    right: -100px;
    animation: float-slow 12s ease-in-out infinite;
  }

  .bg-circle-2 {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, #95efd8, transparent 70%);
    bottom: -100px;
    left: -80px;
    animation: float-slow 15s ease-in-out infinite reverse;
  }

  .bg-circle-3 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, #c3e5ff, transparent 70%);
    top: 40%;
    left: 60%;
    animation: float-slow 10s ease-in-out infinite;
  }

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 60px;
    z-index: 1;

    .text {
      width: 520px;
      animation: fade-in-left 1s ease-out;

      .title {
        font-size: 48px;
        font-weight: 800;
        margin-bottom: 20px;
        line-height: 1.3;
        letter-spacing: 1px;

        .highlight-text {
          background: linear-gradient(135deg, #f2d0d0, #f0afaf);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }

      .description {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.8;
        margin-bottom: 10px;
      }

      .hero-actions {
        margin-top: 35px;
        display: flex;
        gap: 16px;

        .btn-primary {
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 12px;
          background: linear-gradient(135deg, #8192f2, #5c6bc0) !important;
          border: none !important;
          color: #fff !important;
          box-shadow: 0 8px 24px rgba(129, 146, 242, 0.35);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(129, 146, 242, 0.5);
          }
        }

        .btn-outline {
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          color: #fff !important;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            border-color: rgba(255, 255, 255, 0.4) !important;
            transform: translateY(-2px);
          }
        }
      }
    }

    .robot-wrapper {
      position: relative;
      animation: fade-in-right 1s ease-out;

      .robot-glow {
        position: absolute;
        width: 280px;
        height: 280px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(129, 146, 242, 0.3), transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse-glow 3s ease-in-out infinite;
      }

      .robot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.1);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        position: relative;
        z-index: 1;
        animation: float 4s ease-in-out infinite;
      }
    }
  }
}

/* 动画 */
@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

@keyframes float-slow {

  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(20px, -20px);
  }
}

@keyframes pulse-glow {

  0%,
  100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes fade-in-left {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in-right {
  from {
    opacity: 0;
    transform: translateX(40px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
