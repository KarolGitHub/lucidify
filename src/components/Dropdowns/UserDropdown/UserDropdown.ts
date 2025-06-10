import { defineComponent } from "vue";
import { createPopper } from "@popperjs/core";
import { auth } from "@/store";

export default defineComponent({
  name: "UserDropdown",
  data() {
    return {
      dropdownPopoverShow: false,
    };
  },
  methods: {
    toggleDropdown(event: Event) {
      event.preventDefault();
      if (this.dropdownPopoverShow) {
        this.dropdownPopoverShow = false;
      } else {
        this.dropdownPopoverShow = true;
        createPopper(this.$refs.btnDropdownRef, this.$refs.popoverDropdownRef, {
          placement: "bottom-start",
        });
      }
    },
    logout() {
      auth.actions.logout();
    },
  },
});
