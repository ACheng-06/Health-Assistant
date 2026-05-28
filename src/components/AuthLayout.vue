<template>
  <div class="auth-layout">
    <div class="left-section">
      <!-- 背景装饰圆 -->
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>

      <div class="content">
        <h2 class="title">心理AI助手</h2>
        <p class="text">每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心连接，温暖您的每一天</p>
        <div class="robot-wrapper">
          <div class="robot-glow"></div>
          <div class="robot">
            <el-image style="width: 90px; height: 90px;" :src="inconUrl" alt="心理健康助手" />
          </div>
        </div>
      </div>
    </div>
    <div class="right-section">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
  const inconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
</script>


<style lang="scss" scoped>
.auth-layout {
  display: flex;

  .left-section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    background: linear-gradient(135deg, rgb(131, 96, 195), rgb(46, 191, 145));
    height: 100vh;
    position: relative;
    overflow: hidden;

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      pointer-events: none;
    }

    .bg-circle-1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #8192f2, transparent 70%);
      top: -120px;
      right: -80px;
      animation: float-slow 12s ease-in-out infinite;
    }

    .bg-circle-2 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, #95efd8, transparent 70%);
      bottom: -100px;
      left: -60px;
      animation: float-slow 15s ease-in-out infinite reverse;
    }

    .bg-circle-3 {
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, #c3e5ff, transparent 70%);
      top: 50%;
      left: 55%;
      animation: float-slow 10s ease-in-out infinite;
    }

    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1;
      animation: fade-in 1s ease-out;

      .title {
        margin-bottom: 20px;
        font-size: 40px;
        font-weight: bold;
        color: #fff;
      }

      .text {
        margin-bottom: 30px;
        width: 460px;
        font-size: 18px;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
        line-height: 1.8;
      }

      .robot-wrapper {
        position: relative;

        .robot-glow {
          position: absolute;
          width: 180px;
          height: 180px;
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
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1;
          animation: float 4s ease-in-out infinite;
        }
      }
    }
  }

  .right-section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100vh;
    background-color: #fff;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes float-slow {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
