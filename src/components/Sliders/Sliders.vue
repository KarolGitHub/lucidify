<template>
  <div class="container">
    <button @click="previewsSlide" id="left">left</button>
    <div>
      <div class="scroll-snap">
        <div class="slide slide-1">1</div>
        <div class="slide slide-2">2</div>
        <div class="slide slide-3">3</div>
        <div class="slide slide-4">4</div>
        <div class="slide slide-5">5</div>
        <div class="slide slide-6">6</div>
      </div>
      <div class="dots"></div>
    </div>
    <button @click="nextSlide" id="right">right</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Sliders",
  setup() {
    const nextSlide = () => {
      const scrollSnap = document.querySelector(".scroll-snap");
      const scrollSlide = document.querySelectorAll(".slide");
      for (let index = 0; index < scrollSlide.length; index++) {
        var slide = scrollSlide[index];
      }
      scrollSnap!.scrollLeft += slide!.scrollWidth;
      console.debug((scrollSnap!.scrollLeft += slide!.scrollWidth));
    };

    const previewsSlide = () => {
      const scrollSnap = document.querySelector(".scroll-snap");
      const scrollSlide = document.querySelectorAll(".slide");
      for (let index = 0; index < scrollSlide.length; index++) {
        var slide = scrollSlide[index];
      }
      scrollSnap!.scrollLeft -= slide!.scrollWidth;
      console.debug((scrollSnap!.scrollLeft -= slide!.scrollWidth));
    };

    return {
      nextSlide,
      previewsSlide,
    };
  },
});
</script>

<style scoped lang="scss">
select {
  padding: 10px;
  margin: 10px 20px;
  font-size: 16px;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scroll-snap {
  --container-width: 60vw;
  width: clamp(240px, var(--container-width), 1024px);
  overflow-x: auto;
  -ms-scroll-snap-type: x mandatory;
  scroll-snap-type: x mandatory;
  display: grid;
  grid-auto-flow: column;
  scroll-behavior: smooth;
}

.scroll-snap::-webkit-scrollbar {
  display: none;
}

.scroll-snap div {
  scroll-snap-align: center;
  background: hotpink;
  color: white;
  width: var(--container-width);
  aspect-ratio: 16/9;
  display: grid;
  place-content: center;
}

.scroll-snap .slide-1 {
  background-color: rosybrown;
}

.scroll-snap .slide-2 {
  background-color: cornflowerblue;
}

.scroll-snap .slide-3 {
  background-color: teal;
}

.scroll-snap .slide-4 {
  background-color: mediumorchid;
}

.scroll-snap .slide-5 {
  background-color: rebeccapurple;
}

.scroll-snap .slide-6 {
  background-color: burlywood;
}

.dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

.dots .dot {
  display: inline-block;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  margin: 0 5px;
  background-color: rgba(255, 127, 80, 0.7);
  cursor: pointer;
  transition: 0.4s ease-in-out;
  transform: scale(1);
}

.dots .dot:hover,
.dots .dot.active {
  background-color: rgba(255, 127, 80, 1);
  transform: scale(1.25);
}

button {
  padding: 10px 30px;
  border-radius: 5px;
  border: 0;
  background-color: aquamarine;
  color: #000;
  font-weight: 600;
  cursor: pointer;
}
</style>
