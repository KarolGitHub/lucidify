/* import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import ExampleComponent from "../ExampleComponent.vue";

describe("ExampleComponent", () => {
  it("renders properly", () => {
    const wrapper = mount(ExampleComponent, {
      global: {
        plugins: [createTestingPinia()],
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("displays the correct title", () => {
    const title = "Test Title";
    const wrapper = mount(ExampleComponent, {
      props: {
        title,
      },
      global: {
        plugins: [createTestingPinia()],
      },
    });
    expect(wrapper.text()).toContain(title);
  });
}); */
