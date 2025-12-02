import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import pt from "@/locales/pt.json";

const deviceLanguage = Localization.getLocales()[0].languageCode ?? "en";

i18n.use(initReactI18next).init({
  lng: deviceLanguage,
  fallbackLng: "en", //
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
