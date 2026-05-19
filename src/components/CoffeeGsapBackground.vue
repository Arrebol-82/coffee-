<template>
  <div ref="backgroundRef" class="coffee-gsap-background" aria-hidden="true">
    <span
      v-for="spot in glowSpots"
      :key="spot.id"
      class="coffee-gsap-background__glow"
      :style="spot.style"
    />

    <span
      v-for="bean in coffeeBeans"
      :key="bean.id"
      class="coffee-gsap-background__bean"
      :style="bean.style"
    >
      <span class="coffee-gsap-background__bean-line" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";

const backgroundRef = ref<HTMLElement | null>(null);
let gsapContext: gsap.Context | null = null;

const glowSpots = [
  {
    id: "cream-top-left",
    style: {
      left: "-8%",
      top: "6%",
      width: "34rem",
      height: "34rem",
      background:
        "radial-gradient(circle, rgba(255, 219, 168, 0.55) 0%, rgba(218, 154, 92, 0.22) 42%, rgba(218, 154, 92, 0) 72%)",
    },
  },
  {
    id: "latte-top-right",
    style: {
      right: "-6%",
      top: "10%",
      width: "28rem",
      height: "28rem",
      background:
        "radial-gradient(circle, rgba(255, 239, 206, 0.5) 0%, rgba(172, 113, 66, 0.2) 48%, rgba(172, 113, 66, 0) 74%)",
    },
  },
  {
    id: "caramel-bottom",
    style: {
      left: "30%",
      bottom: "-16%",
      width: "38rem",
      height: "38rem",
      background:
        "radial-gradient(circle, rgba(218, 164, 102, 0.32) 0%, rgba(126, 77, 45, 0.16) 50%, rgba(126, 77, 45, 0) 76%)",
    },
  },
];

const coffeeBeans = [
  { id: "bean-1", style: { left: "12%", top: "34%", width: "1.8rem", height: "2.55rem", "--bean-rotate": "-18deg" } },
  { id: "bean-2", style: { left: "24%", top: "76%", width: "1.35rem", height: "1.95rem", "--bean-rotate": "24deg" } },
  { id: "bean-3", style: { left: "58%", top: "18%", width: "1.5rem", height: "2.15rem", "--bean-rotate": "12deg" } },
  { id: "bean-4", style: { left: "72%", top: "62%", width: "1.7rem", height: "2.35rem", "--bean-rotate": "-28deg" } },
  { id: "bean-5", style: { left: "88%", top: "36%", width: "1.25rem", height: "1.85rem", "--bean-rotate": "18deg" } },
  { id: "bean-6", style: { left: "44%", top: "88%", width: "1.45rem", height: "2.05rem", "--bean-rotate": "-8deg" } },
];

onMounted(() => {
  if (!backgroundRef.value) return;

  gsapContext = gsap.context(() => {
    gsap.to(".coffee-gsap-background__glow", {
      scale: 1.08,
      x: 18,
      y: -12,
      opacity: 0.78,
      duration: 8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: {
        each: 1.2,
        yoyo: true,
      },
    });

    gsap.utils.toArray<HTMLElement>(".coffee-gsap-background__bean").forEach((bean, index) => {
      gsap.to(bean, {
        y: index % 2 === 0 ? 14 : -12,
        x: index % 3 === 0 ? 8 : -6,
        rotation: index % 2 === 0 ? "+=7" : "-=6",
        duration: 5.5 + index * 0.45,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });
  }, backgroundRef.value);
});

onBeforeUnmount(() => {
  gsapContext?.revert();
});
</script>

<style scoped>
.coffee-gsap-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  background:
    linear-gradient(135deg, rgba(255, 249, 239, 0.96) 0%, rgba(239, 220, 197, 0.96) 42%, rgba(201, 163, 125, 0.9) 100%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0));
}

.coffee-gsap-background::before {
  position: absolute;
  inset: 0;
  content: "";
  background-image:
    linear-gradient(rgba(112, 72, 44, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(112, 72, 44, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.48), transparent 72%);
}

.coffee-gsap-background__glow {
  position: absolute;
  display: block;
  border-radius: 999px;
  opacity: 0.6;
  filter: blur(18px);
  transform: translate3d(0, 0, 0);
  will-change: transform, opacity;
}

.coffee-gsap-background__bean {
  position: absolute;
  display: block;
  border-radius: 50%;
  opacity: 0.2;
  background:
    radial-gradient(circle at 34% 28%, rgba(255, 230, 190, 0.55), transparent 24%),
    linear-gradient(135deg, #7b4b31 0%, #4f2d1f 56%, #2e1911 100%);
  box-shadow: 0 14px 32px rgba(74, 42, 25, 0.18);
  transform: rotate(var(--bean-rotate, 0deg));
  will-change: transform;
}

.coffee-gsap-background__bean-line {
  position: absolute;
  top: 12%;
  left: 48%;
  width: 18%;
  height: 76%;
  border-left: 2px solid rgba(255, 224, 184, 0.28);
  border-radius: 50%;
  transform: rotate(13deg);
}

@media (max-width: 768px) {
  .coffee-gsap-background__glow {
    filter: blur(14px);
  }

  .coffee-gsap-background__bean {
    opacity: 0.16;
  }
}
</style>
