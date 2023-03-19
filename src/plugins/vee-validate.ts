import { defineRule, configure } from "vee-validate";
import { localize, setLocale } from "@vee-validate/i18n";
import en from "@vee-validate/i18n/dist/locale/en.json";
import { email, min, required, confirmed } from "@vee-validate/rules";

configure({
  generateMessage: localize({
    en,
  }),
});

setLocale("en");

defineRule("email", email);
defineRule("required", required);
defineRule("min", min);
defineRule("confirmed", confirmed);
