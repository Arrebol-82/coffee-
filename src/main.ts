import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";

import "./style.css";
import App from "./App.vue";

async function enableMocking() {
  const mockHosts = ["rexcode.xyz", "coffee-inky-phi.vercel.app"];
  const shouldUseMockApi =
    import.meta.env.DEV || mockHosts.includes(window.location.hostname);

  if (shouldUseMockApi) {
    const { worker } = await import("./mocks/browser");

    return worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
    });
  }
}

enableMocking().then(() => {
  const app = createApp(App);

  app.use(createPinia());
  app.use(ElementPlus);
  app.use(router);

  app.mount("#app");
});
