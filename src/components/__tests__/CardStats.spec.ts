import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CardStats from "../Cards/CardStats/CardStats.vue";

describe("CardStats.vue", () => {
  it("renders with default props", () => {
    const wrapper = mount(CardStats);

    expect(wrapper.find("h5").text()).toBe("Traffic");
    expect(wrapper.find(".font-semibold").text()).toBe("350,897");
    expect(wrapper.find(".fa-arrow-up").exists()).toBe(true);
    expect(wrapper.find(".mr-2").text()).toContain("3.48%");
    expect(wrapper.find(".whitespace-nowrap").text()).toBe("Since last month");
    expect(wrapper.find(".fa-chart-bar").exists()).toBe(true);
    expect(wrapper.find(".bg-red-500").exists()).toBe(true);
  });

  it("renders with custom props", () => {
    const wrapper = mount(CardStats, {
      props: {
        statSubtitle: "New Users",
        statTitle: "5,000",
        statArrow: "down",
        statPercent: "1.5",
        statPercentColor: "text-red-500",
        statDescripiron: "Since yesterday",
        statIconName: "fas fa-users",
        statIconColor: "bg-blue-500",
      },
    });

    expect(wrapper.find("h5").text()).toBe("New Users");
    expect(wrapper.find(".font-semibold").text()).toBe("5,000");
    expect(wrapper.find(".fa-arrow-down").exists()).toBe(true);
    expect(wrapper.find(".fa-arrow-up").exists()).toBe(false);
    expect(wrapper.find(".mr-2").text()).toContain("1.5%");
    expect(wrapper.find(".mr-2").classes()).toContain("text-red-500");
    expect(wrapper.find(".whitespace-nowrap").text()).toBe("Since yesterday");
    expect(wrapper.find(".fa-users").exists()).toBe(true);
    expect(wrapper.find(".bg-blue-500").exists()).toBe(true);
  });

  it("validates statArrow prop", () => {
    const validator = (CardStats as any).props.statArrow.validator;
    expect(validator("up")).toBe(true);
    expect(validator("down")).toBe(true);
    expect(validator("left")).toBe(false);
  });
});
