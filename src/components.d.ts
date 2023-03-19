import "@vue/runtime-core";
// import CardStockChart from "@/components/Cards/CardStockChart/CardStockChart.vue";
export {};

declare module "@vue/runtime-core" {
  export interface GlobalComponents {
    // CardStockChart: typeof import("@/components/Cards/CardStockChart/CardStockChart.vue")["CardStockChart"];
  }
}
