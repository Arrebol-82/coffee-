<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';

const router = useRouter();

const carouselSlides = ref([
  {
    title: '全新限定',
    desc: '冬日特调 · 暖心上线',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=600&fit=crop'
  },
  {
    title: '会员专享',
    desc: '加入会员 · 享更多优惠',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&h=600&fit=crop'
  },
  {
    title: '早餐搭配',
    desc: '完美早餐 · 从一杯咖啡开始',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&h=600&fit=crop'
  },
  {
    title: '下午茶时光',
    desc: '悠闲午后 · 咖啡与甜点的约会',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&h=600&fit=crop'
  }
]);

const currentSlide = ref(0);
let autoSlideInterval: number | null = null;

const nextSlide = () => {
  if (currentSlide.value < carouselSlides.value.length - 1) {
    currentSlide.value++;
  } else {
    currentSlide.value = 0;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  } else {
    currentSlide.value = carouselSlides.value.length - 1;
  }
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const startAutoSlide = () => {
  autoSlideInterval = window.setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
};

onMounted(() => {
  startAutoSlide();
});

onUnmounted(() => {
  stopAutoSlide();
});

const coffeeCategories = ref([
  {
    title: '浓缩咖啡',
    desc: '浓缩咖啡是意式咖啡的精髓，口感浓郁且微苦，入口后余韵悠长。它分量小但浓度高，酸甜苦完美平衡，是咖啡爱好者的首选。由于其强烈的口感，适合喜欢浓郁咖啡味的上班族。',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop',
    color: '#3d2317'
  },
  {
    title: '美式咖啡',
    desc: '美式咖啡属于黑咖啡的一种，口感清爽，能突出咖啡的原始风味。它是通过在浓缩咖啡中加入大量水制成的，因此口味相对较淡，但咖啡因含量较高，适合追求纯粹咖啡豆口感的人。',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop',
    color: '#4a3020'
  },
  {
    title: '拿铁咖啡',
    desc: '拿铁咖啡是浓缩咖啡与牛奶的经典混合，口感顺滑且甜而不腻。牛奶中的乳脂能增加咖啡的甜度和顺滑感，使整体口感更加平衡。它适合初次尝试咖啡的人，以及喜欢牛奶温和口感的人。',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    color: '#8b5a2b'
  },
  {
    title: '卡布奇诺',
    desc: '卡布奇诺是一种奶香四溢、奶泡绵密的咖啡。它以等量的浓缩咖啡和蒸汽泡沫牛奶混合而成，口感绵密且咖啡味浓郁。卡布奇诺的命名源于其颜色，就像卡布奇诺教会的修士在深褐色的外衣上覆上一条头巾一样。',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    color: '#a06b3c'
  },
  {
    title: '摩卡咖啡',
    desc: '摩卡咖啡是一种由意大利浓缩咖啡、巧克力酱、鲜奶油和牛奶混合而成的咖啡，它口感独特，甘中带酸、苦甜交织，极为优雅。摩卡咖啡的巧克力香味醇厚，让人欲罢不能，是高级人士所喜爱的优良品种。',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
    color: '#5d3a1a'
  },
  {
    title: '焦糖玛琪朵',
    desc: '焦糖玛琪朵是一种在玛奇朵基础上加入纯正焦糖的咖啡。它口感香甜十足，是怕苦人士的福音。焦糖玛琪朵的制作过程充满匠心，首先热牛奶加上纯正浓缩咖啡和香草，最后淋上纯正焦糖，形成了其独特的甜美口感。',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=300&fit=crop',
    color: '#b07a4d'
  }
]);

const goToOrder = () => {
  router.push('/order');
};
</script>

<template>
  <div class="home-page">
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
      <div class="bg-particles">
        <div v-for="i in 30" :key="i" class="particle" :style="{ animationDelay: `${i * 0.2}s` }"></div>
      </div>
    </div>

    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon-wrapper">
            <span class="logo-icon">☕</span>
          </div>
          <div class="logo-text-wrapper">
            <span class="logo-text coffeesys-brand-text">CoffeeSys</span>
            <span class="logo-subtitle">咖啡大师</span>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-icon">✨</span>
            全新升级
          </div>
          <h1 class="hero-title">
            一杯咖啡<br>
            <span class="highlight">一份美好</span>
          </h1>
          <p class="hero-subtitle">
            精选全球优质咖啡豆<br>
            为您呈现最纯粹的咖啡体验
          </p>
          <div class="hero-actions">
            <el-button 
              type="primary" 
              size="large" 
              class="order-btn"
              @click="goToOrder"
            >
              <span class="btn-icon">🛒</span>
              立即下单
            </el-button>
          </div>
        </div>
        <div class="hero-image">
          <div class="coffee-cup">
            <div class="cup">
              <div class="cup-body"></div>
              <div class="cup-handle"></div>
              <div class="coffee">
                <div class="coffee-layer coffee-layer-1"></div>
                <div class="coffee-layer coffee-layer-2"></div>
                <div class="coffee-layer coffee-layer-3"></div>
              </div>
              <div class="steam">
                <div class="steam-steam"></div>
                <div class="steam-steam"></div>
                <div class="steam-steam"></div>
              </div>
            </div>
            <div class="cup-glow"></div>
          </div>
        </div>
      </div>

      <div class="carousel-section">
        <div class="section-header">
          <h2 class="section-title">精选推荐</h2>
          <span class="section-subtitle">发现更多精彩</span>
        </div>
        
        <div class="carousel-container">
          <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div class="carousel-slide" v-for="(slide, index) in carouselSlides" :key="index">
              <div class="slide-bg" :style="{ backgroundImage: `url(${slide.image})` }"></div>
              <div class="slide-content">
                <h3 class="slide-title">{{ slide.title }}</h3>
                <p class="slide-desc">{{ slide.desc }}</p>
              </div>
            </div>
          </div>
          
          <button class="carousel-btn prev-btn" @click="prevSlide" :disabled="currentSlide === 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button class="carousel-btn next-btn" @click="nextSlide" :disabled="currentSlide === carouselSlides.length - 1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          
          <div class="carousel-dots">
            <div 
              class="carousel-dot" 
              v-for="(slide, index) in carouselSlides" 
              :key="index"
              :class="{ active: index === currentSlide }"
              @click="goToSlide(index)"
            ></div>
          </div>
        </div>
      </div>

      <div class="coffee-categories-section">
        <div class="section-header">
          <h2 class="section-title">咖啡品类</h2>
          <span class="section-subtitle">总有一款适合你</span>
        </div>
        
        <div class="categories-grid">
          <div class="category-card" v-for="(category, index) in coffeeCategories" :key="index" :class="`category-${index}`">
            <div class="category-bg" :style="{ backgroundImage: `url(${category.image})` }"></div>
            <div class="category-content">
              <h3 class="category-title">{{ category.title }}</h3>
              <p class="category-desc">{{ category.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-grid">
          <div class="info-card award-card">
            <h3 class="info-title">获奖</h3>
            <ul class="info-list">
              <li>2020年本地咖啡豆竞赛第一名</li>
              <li>2022年咖啡豆品鉴会季军</li>
              <li>2023年首届咖啡庄园生豆赛水洗组第二名等荣誉</li>
            </ul>
          </div>
          
          <div class="info-card event-card">
            <h3 class="info-title">事件</h3>
            <div class="event-list">
              <div class="event-item">
                <div class="event-date">
                  <div class="event-day">20</div>
                  <div class="event-month">OCT</div>
                </div>
                <div class="event-content">
                  <p>全国200家门店启</p>
                </div>
              </div>
              <div class="event-item">
                <div class="event-date">
                  <div class="event-day">17</div>
                  <div class="event-month">AUG</div>
                </div>
                <div class="event-content">
                  <p>第一家店铺开业</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="info-card booking-card">
            <h3 class="info-title">预订</h3>
            <p class="booking-desc">欢迎广大客户在各大平台进行订购，也可选择进店购买。</p>
            <div class="booking-phone">410-410-544</div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <span class="footer-icon">☕</span>
          <span class="coffeesys-brand-text">CoffeeSys</span>
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">关于我们</a>
          <a href="#" class="footer-link">门店查询</a>
          <a href="#" class="footer-link">加入会员</a>
          <a href="#" class="footer-link">联系我们</a>
        </div>
        <div class="footer-copyright">
          © 2024 Coffee Master. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a15 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%);
  position: relative;
  overflow-x: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
}

.bg-circle-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #d4af37 0%, transparent 70%);
  top: -100px;
  right: -100px;
  animation: float 15s ease-in-out infinite;
}

.bg-circle-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #ffd700 0%, transparent 70%);
  bottom: 20%;
  left: -50px;
  animation: float 12s ease-in-out infinite reverse;
}

.bg-circle-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, #c0c0c0 0%, transparent 70%);
  top: 50%;
  right: 10%;
  animation: float 18s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

.bg-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, #d4af37 0%, transparent 70%);
  border-radius: 50%;
  animation: particleFloat 10s ease-in-out infinite;
}

.particle:nth-child(1) { top: 10%; left: 15%; }
.particle:nth-child(2) { top: 20%; left: 35%; }
.particle:nth-child(3) { top: 30%; left: 55%; }
.particle:nth-child(4) { top: 40%; left: 75%; }
.particle:nth-child(5) { top: 50%; left: 90%; }
.particle:nth-child(6) { top: 60%; left: 80%; }
.particle:nth-child(7) { top: 70%; left: 60%; }
.particle:nth-child(8) { top: 80%; left: 40%; }
.particle:nth-child(9) { top: 90%; left: 20%; }
.particle:nth-child(10) { top: 15%; left: 85%; }
.particle:nth-child(11) { top: 25%; left: 65%; }
.particle:nth-child(12) { top: 35%; left: 45%; }
.particle:nth-child(13) { top: 45%; left: 25%; }
.particle:nth-child(14) { top: 55%; left: 5%; }
.particle:nth-child(15) { top: 65%; left: 30%; }
.particle:nth-child(16) { top: 75%; left: 50%; }
.particle:nth-child(17) { top: 85%; left: 70%; }
.particle:nth-child(18) { top: 95%; left: 88%; }
.particle:nth-child(19) { top: 12%; left: 50%; }
.particle:nth-child(20) { top: 22%; left: 8%; }
.particle:nth-child(21) { top: 32%; left: 88%; }
.particle:nth-child(22) { top: 42%; left: 68%; }
.particle:nth-child(23) { top: 52%; left: 48%; }
.particle:nth-child(24) { top: 62%; left: 28%; }
.particle:nth-child(25) { top: 72%; left: 8%; }
.particle:nth-child(26) { top: 82%; left: 38%; }
.particle:nth-child(27) { top: 92%; left: 58%; }
.particle:nth-child(28) { top: 18%; left: 78%; }
.particle:nth-child(29) { top: 28%; left: 95%; }
.particle:nth-child(30) { top: 38%; left: 18%; }

@keyframes particleFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-80vh) scale(0.5); opacity: 0; }
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20px 24px;
  background: linear-gradient(180deg, rgba(10, 10, 21, 0.95) 0%, rgba(26, 26, 46, 0.85) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon-wrapper {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #d4af37 100%);
  background-size: 200% 200%;
  animation: gradientSpin 4s linear infinite;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

@keyframes gradientSpin {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.logo-icon {
  font-size: 26px;
}

.logo-text-wrapper {
  display: flex;
  flex-direction: column;
}

.logo-text {
  font-size: 18px;
  font-weight: 900;
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 11px;
  color: #c0c0c0;
  font-weight: 500;
  letter-spacing: 2px;
  margin-top: 2px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  margin-bottom: 80px;
}

.hero-content {
  position: relative;
  z-index: 10;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50px;
  color: #ffd700;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.badge-icon {
  font-size: 16px;
}

.hero-title {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.2;
  color: #ffffff;
  margin: 0 0 16px 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.highlight {
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-subtitle {
  font-size: 20px;
  color: #c0c0c0;
  line-height: 1.6;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.order-btn {
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px;
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #d4af37 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  border: none;
  color: #0a0a15;
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4);
  transition: all 0.3s ease;
}

.order-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 40px rgba(212, 175, 55, 0.6);
}

.btn-icon {
  margin-right: 8px;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.coffee-cup {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cup {
  position: relative;
  width: 200px;
  height: 200px;
  animation: cupFloat 3s ease-in-out infinite;
}

@keyframes cupFloat {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
}

.cup-body {
  position: absolute;
  width: 180px;
  height: 200px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 0 0 60px 60px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  backdrop-filter: blur(10px);
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
}

.cup-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

.cup-handle {
  position: absolute;
  right: -30px;
  top: 40px;
  width: 50px;
  height: 70px;
  border: 4px solid rgba(212, 175, 55, 0.4);
  border-left: none;
  border-radius: 0 40px 40px 0;
}

.coffee {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 150px;
  border-radius: 0 0 50px 50px;
  overflow: hidden;
}

.coffee-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 0 0 50px 50px;
}

.coffee-layer-1 {
  background: linear-gradient(180deg, #3d2317 0%, #2d1b13 100%);
  animation: coffeeWave 4s ease-in-out infinite;
}

.coffee-layer-2 {
  background: linear-gradient(180deg, #4d2b1b 0%, #3d2317 100%);
  opacity: 0.8;
  animation: coffeeWave 4s ease-in-out infinite 0.5s;
}

.coffee-layer-3 {
  background: linear-gradient(180deg, #5d331f 0%, #4d2b1b 100%);
  opacity: 0.6;
  animation: coffeeWave 4s ease-in-out infinite 1s;
}

@keyframes coffeeWave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

.steam {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.steam-steam {
  width: 8px;
  height: 60px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%);
  border-radius: 50%;
  animation: steamRise 2s ease-in-out infinite;
}

.steam-steam:nth-child(1) { animation-delay: 0s; }
.steam-steam:nth-child(2) { animation-delay: 0.5s; }
.steam-steam:nth-child(3) { animation-delay: 1s; }

@keyframes steamRise {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  100% { transform: translateY(-40px) scale(1.5); opacity: 0; }
}

.cup-glow {
  position: absolute;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.carousel-section {
  margin-bottom: 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 14px;
  color: #f0e0c8;
  font-weight: 600;
}

.carousel-container {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.7) 100%);
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.carousel-track {
  display: flex;
  transition: transform 0.6s ease-in-out;
}

.carousel-slide {
  min-width: 100%;
  position: relative;
  height: 400px;
}

.slide-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.slide-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  background: linear-gradient(180deg, transparent 0%, rgba(45, 27, 19, 0.7) 50%, rgba(61, 35, 23, 0.98) 100%);
  z-index: 2;
}

.slide-title {
  font-size: 36px;
  font-weight: 800;
  color: #fff8e7;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.4);
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slide-desc {
  font-size: 18px;
  color: #f0e0c8;
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(61, 35, 23, 0.9);
  border: 2px solid rgba(212, 175, 55, 0.6);
  color: #d4af37;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.carousel-btn:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.9);
  color: #3d2317;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-btn svg {
  width: 24px;
  height: 24px;
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.carousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.carousel-dot:hover {
  background: rgba(212, 175, 55, 0.6);
}

.carousel-dot.active {
  background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
  transform: scale(1.3);
  border-color: #3d2317;
}

.coffee-categories-section {
  margin-bottom: 80px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.category-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  height: 280px;
  cursor: pointer;
  transition: all 0.4s ease;
  border: 4px solid transparent;
}

.category-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.category-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s ease;
  z-index: 1;
}

.category-card:hover .category-bg {
  transform: scale(1.1);
}

.category-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(180deg, transparent 0%, rgba(45, 27, 19, 0.7) 50%, rgba(61, 35, 23, 0.95) 100%);
  z-index: 2;
  transition: all 0.4s ease;
}

.category-card:hover .category-content {
  background: linear-gradient(180deg, rgba(45, 27, 19, 0.4) 0%, rgba(61, 35, 23, 0.85) 50%, rgba(61, 35, 23, 0.98) 100%);
}

.category-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff8e7;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.3);
}

.category-desc {
  font-size: 14px;
  color: #f0e0c8;
  margin: 0;
  line-height: 1.6;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-0 {
  border-color: #3d2317;
  box-shadow: 0 0 0 3px #3d231740, 0 8px 32px rgba(0, 0, 0, 0.3);
}

.category-0:hover {
  box-shadow: 0 0 30px #3d231760, 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 175, 55, 0.3);
}

.category-1 {
  border-color: #4a3020;
  box-shadow: 0 0 0 3px #4a302040, 0 8px 32px rgba(0, 0, 0, 0.3);
}

.category-1:hover {
  box-shadow: 0 0 30px #4a302060, 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 175, 55, 0.3);
}

.category-2 {
  border-color: #8b5a2b;
  box-shadow: 0 0 0 3px #8b5a2b40, 0 8px 32px rgba(0, 0, 0, 0.3);
}

.category-2:hover {
  box-shadow: 0 0 30px #8b5a2b60, 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 175, 55, 0.3);
}

.category-3 {
  border-color: #a06b3c;
  box-shadow: 0 0 0 3px #a06b3c40, 0 8px 32px rgba(0, 0, 0, 0.3);
}

.category-3:hover {
  box-shadow: 0 0 30px #a06b3c60, 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 175, 55, 0.3);
}

.category-4 {
  border-color: #5d3a1a;
  box-shadow: 0 0 0 3px #5d3a1a40, 0 8px 32px rgba(0, 0, 0, 0.3);
}

.category-4:hover {
  box-shadow: 0 0 30px #5d3a1a60, 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 175, 55, 0.3);
}

.category-5 {
  border-color: #b07a4d;
  box-shadow: 0 0 0 3px #b07a4d40, 0 8px 32px rgba(0, 0, 0, 0.3);
}

.category-5:hover {
  box-shadow: 0 0 30px #b07a4d60, 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 175, 55, 0.3);
}

.info-section {
  margin-bottom: 60px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.info-card {
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d4bc 100%);
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.info-card::before {
  content: '';
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  transform: rotate(15deg);
}

.info-title {
  font-size: 28px;
  font-weight: 700;
  color: #6b4423;
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  font-size: 14px;
  color: #5a3817;
  margin-bottom: 12px;
  line-height: 1.6;
  padding-left: 16px;
  position: relative;
}

.info-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #8b5a2b;
  font-weight: bold;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.event-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.event-day {
  font-size: 32px;
  font-weight: 800;
  color: #6b4423;
  line-height: 1;
}

.event-month {
  font-size: 14px;
  color: #8b5a2b;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 4px;
}

.event-content {
  flex: 1;
  padding-top: 8px;
}

.event-content p {
  margin: 0;
  font-size: 14px;
  color: #5a3817;
  line-height: 1.5;
}

.booking-desc {
  font-size: 14px;
  color: #5a3817;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.booking-phone {
  font-size: 32px;
  font-weight: 700;
  color: #6b4423;
  text-align: center;
  letter-spacing: 2px;
}

.footer {
  background: rgba(10, 10, 21, 0.8);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  padding: 40px 24px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-logo {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.footer-icon {
  font-size: 24px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.footer-link {
  color: #c0c0c0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #ffd700;
}

.footer-copyright {
  font-size: 12px;
  color: #666666;
}

@media (max-width: 968px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-image {
    order: -1;
  }

  .carousel-slide {
    height: 350px;
  }

  .slide-title {
    font-size: 28px;
  }

  .slide-desc {
    font-size: 16px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .hero-title {
    font-size: 36px;
  }

  .carousel-slide {
    height: 280px;
  }

  .slide-content {
    padding: 24px;
  }

  .slide-title {
    font-size: 22px;
  }

  .slide-desc {
    font-size: 14px;
  }

  .carousel-btn {
    width: 40px;
    height: 40px;
  }

  .prev-btn {
    left: 12px;
  }

  .next-btn {
    right: 12px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-card {
    height: 260px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    padding: 24px;
  }

  .info-title {
    font-size: 24px;
  }

  .booking-phone {
    font-size: 26px;
  }

  .footer-links {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
