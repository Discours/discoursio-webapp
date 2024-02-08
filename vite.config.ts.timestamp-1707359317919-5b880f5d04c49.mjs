// vite.config.ts
import ssrPlugin from "file:///Users/kindus/code/dev.discours.io/webapp/node_modules/vike/dist/esm/node/plugin/index.js";
import { defineConfig } from "file:///Users/kindus/code/dev.discours.io/webapp/node_modules/vite/dist/node/index.js";
import mkcert from "file:///Users/kindus/code/dev.discours.io/webapp/node_modules/vite-plugin-mkcert/dist/mkcert.mjs";
import sassDts from "file:///Users/kindus/code/dev.discours.io/webapp/node_modules/vite-plugin-sass-dts/dist/index.js";
import solidPlugin from "file:///Users/kindus/code/dev.discours.io/webapp/node_modules/vite-plugin-solid/dist/esm/index.mjs";
var cssModuleHMR = () => {
  return {
    enforce: "post",
    name: "css-module-hmr",
    apply: "serve",
    handleHotUpdate(context) {
      const { modules } = context;
      modules.forEach((module) => {
        if (module.id.includes(".module.scss")) {
          module.isSelfAccepting = true;
        }
      });
    }
  };
};
var PATH_PREFIX = "/src/";
var getDevCssClassPrefix = (filename) => {
  return filename.slice(filename.indexOf(PATH_PREFIX) + PATH_PREFIX.length).replace(".module.scss", "").replace(/[/?\\]/g, "-");
};
var devGenerateScopedName = (name, filename, _css) => `${getDevCssClassPrefix(filename)}__${name}`;
var vite_config_default = defineConfig(({ mode, command }) => {
  const plugins = [
    solidPlugin({ ssr: true }),
    ssrPlugin({ includeAssetsImportedByServer: true }),
    sassDts(),
    cssModuleHMR()
  ];
  if (command === "serve") {
    plugins.push(mkcert());
  }
  const isDev = mode === "development";
  return {
    envPrefix: "PUBLIC_",
    plugins,
    server: {
      https: true,
      port: 3e3
    },
    css: {
      devSourcemap: isDev,
      preprocessorOptions: {
        scss: { additionalData: '@import "src/styles/imports";\n' }
      },
      modules: {
        generateScopedName: isDev ? devGenerateScopedName : "[hash:base64:5]"
      }
    },
    build: {
      rollupOptions: {
        external: []
      },
      chunkSizeWarningLimit: 1024,
      target: "esnext"
    },
    ssr: {
      noExternal: [
        "solid-js",
        "@nanostores/solid",
        "@urql/core",
        "wonka",
        "solid-popper",
        "seroval",
        "@solid-primitives/share",
        "i18next",
        "js-cookie",
        "@solid-primitives/memo",
        "@solid-primitives/media",
        "@solid-primitives/storage",
        "@solid-primitives/utils",
        "@solid-primitives/rootless",
        "solid-tiptap",
        "@tiptap/extension-document",
        "@tiptap/core",
        "@tiptap/pm",
        "prosemirror-state",
        "prosemirror-model",
        "prosemirror-transform",
        "prosemirror-commands",
        "prosemirror-schema-list",
        "@tiptap/extension-text",
        "@tiptap/extension-paragraph",
        "@tiptap/extension-bold",
        "@tiptap/extension-italic",
        "@tiptap/extension-blockquote",
        "@solid-primitives/upload",
        "@tiptap/extension-placeholder",
        "prosemirror-view",
        "@tiptap/extension-link",
        "@tiptap/extension-image",
        "@tiptap/extension-character-count",
        "clsx"
      ]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva2luZHVzL2NvZGUvZGV2LmRpc2NvdXJzLmlvL3dlYmFwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2tpbmR1cy9jb2RlL2Rldi5kaXNjb3Vycy5pby93ZWJhcHAvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2tpbmR1cy9jb2RlL2Rldi5kaXNjb3Vycy5pby93ZWJhcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgc3NyUGx1Z2luIGZyb20gJ3Zpa2UvcGx1Z2luJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCBta2NlcnQgZnJvbSAndml0ZS1wbHVnaW4tbWtjZXJ0J1xuaW1wb3J0IHNhc3NEdHMgZnJvbSAndml0ZS1wbHVnaW4tc2Fzcy1kdHMnXG5pbXBvcnQgc29saWRQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tc29saWQnXG5cbmNvbnN0IGNzc01vZHVsZUhNUiA9ICgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBlbmZvcmNlOiAncG9zdCcsXG4gICAgbmFtZTogJ2Nzcy1tb2R1bGUtaG1yJyxcbiAgICBhcHBseTogJ3NlcnZlJyxcbiAgICBoYW5kbGVIb3RVcGRhdGUoY29udGV4dCkge1xuICAgICAgY29uc3QgeyBtb2R1bGVzIH0gPSBjb250ZXh0XG5cbiAgICAgIG1vZHVsZXMuZm9yRWFjaCgobW9kdWxlKSA9PiB7XG4gICAgICAgIGlmIChtb2R1bGUuaWQuaW5jbHVkZXMoJy5tb2R1bGUuc2NzcycpKSB7XG4gICAgICAgICAgbW9kdWxlLmlzU2VsZkFjY2VwdGluZyA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICB9XG59XG5cbmNvbnN0IFBBVEhfUFJFRklYID0gJy9zcmMvJ1xuXG5jb25zdCBnZXREZXZDc3NDbGFzc1ByZWZpeCA9IChmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIGZpbGVuYW1lXG4gICAgLnNsaWNlKGZpbGVuYW1lLmluZGV4T2YoUEFUSF9QUkVGSVgpICsgUEFUSF9QUkVGSVgubGVuZ3RoKVxuICAgIC5yZXBsYWNlKCcubW9kdWxlLnNjc3MnLCAnJylcbiAgICAucmVwbGFjZSgvWy8/XFxcXF0vZywgJy0nKVxufVxuXG5jb25zdCBkZXZHZW5lcmF0ZVNjb3BlZE5hbWUgPSAobmFtZTogc3RyaW5nLCBmaWxlbmFtZTogc3RyaW5nLCBfY3NzOiBzdHJpbmcpID0+XG4gIGAke2dldERldkNzc0NsYXNzUHJlZml4KGZpbGVuYW1lKX1fXyR7bmFtZX1gXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlLCBjb21tYW5kIH0pID0+IHtcbiAgY29uc3QgcGx1Z2lucyA9IFtcbiAgICBzb2xpZFBsdWdpbih7IHNzcjogdHJ1ZSB9KSxcbiAgICBzc3JQbHVnaW4oeyBpbmNsdWRlQXNzZXRzSW1wb3J0ZWRCeVNlcnZlcjogdHJ1ZSB9KSxcbiAgICBzYXNzRHRzKCksXG4gICAgY3NzTW9kdWxlSE1SKCksXG4gIF1cblxuICBpZiAoY29tbWFuZCA9PT0gJ3NlcnZlJykge1xuICAgIHBsdWdpbnMucHVzaChta2NlcnQoKSlcbiAgfVxuXG4gIGNvbnN0IGlzRGV2ID0gbW9kZSA9PT0gJ2RldmVsb3BtZW50J1xuXG4gIHJldHVybiB7XG4gICAgZW52UHJlZml4OiAnUFVCTElDXycsXG4gICAgcGx1Z2lucyxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGh0dHBzOiB0cnVlLFxuICAgICAgcG9ydDogMzAwMCxcbiAgICB9LFxuICAgIGNzczoge1xuICAgICAgZGV2U291cmNlbWFwOiBpc0RldixcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2NzczogeyBhZGRpdGlvbmFsRGF0YTogJ0BpbXBvcnQgXCJzcmMvc3R5bGVzL2ltcG9ydHNcIjtcXG4nIH0sXG4gICAgICB9LFxuICAgICAgbW9kdWxlczoge1xuICAgICAgICBnZW5lcmF0ZVNjb3BlZE5hbWU6IGlzRGV2ID8gZGV2R2VuZXJhdGVTY29wZWROYW1lIDogJ1toYXNoOmJhc2U2NDo1XScsXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgZXh0ZXJuYWw6IFtdLFxuICAgICAgfSxcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAyNCxcbiAgICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgfSxcbiAgICBzc3I6IHtcbiAgICAgIG5vRXh0ZXJuYWw6IFtcbiAgICAgICAgJ3NvbGlkLWpzJyxcbiAgICAgICAgJ0BuYW5vc3RvcmVzL3NvbGlkJyxcbiAgICAgICAgJ0B1cnFsL2NvcmUnLFxuICAgICAgICAnd29ua2EnLFxuICAgICAgICAnc29saWQtcG9wcGVyJyxcbiAgICAgICAgJ3Nlcm92YWwnLFxuICAgICAgICAnQHNvbGlkLXByaW1pdGl2ZXMvc2hhcmUnLFxuICAgICAgICAnaTE4bmV4dCcsXG4gICAgICAgICdqcy1jb29raWUnLFxuICAgICAgICAnQHNvbGlkLXByaW1pdGl2ZXMvbWVtbycsXG4gICAgICAgICdAc29saWQtcHJpbWl0aXZlcy9tZWRpYScsXG4gICAgICAgICdAc29saWQtcHJpbWl0aXZlcy9zdG9yYWdlJyxcbiAgICAgICAgJ0Bzb2xpZC1wcmltaXRpdmVzL3V0aWxzJyxcbiAgICAgICAgJ0Bzb2xpZC1wcmltaXRpdmVzL3Jvb3RsZXNzJyxcbiAgICAgICAgJ3NvbGlkLXRpcHRhcCcsXG4gICAgICAgICdAdGlwdGFwL2V4dGVuc2lvbi1kb2N1bWVudCcsXG4gICAgICAgICdAdGlwdGFwL2NvcmUnLFxuICAgICAgICAnQHRpcHRhcC9wbScsXG4gICAgICAgICdwcm9zZW1pcnJvci1zdGF0ZScsXG4gICAgICAgICdwcm9zZW1pcnJvci1tb2RlbCcsXG4gICAgICAgICdwcm9zZW1pcnJvci10cmFuc2Zvcm0nLFxuICAgICAgICAncHJvc2VtaXJyb3ItY29tbWFuZHMnLFxuICAgICAgICAncHJvc2VtaXJyb3Itc2NoZW1hLWxpc3QnLFxuICAgICAgICAnQHRpcHRhcC9leHRlbnNpb24tdGV4dCcsXG4gICAgICAgICdAdGlwdGFwL2V4dGVuc2lvbi1wYXJhZ3JhcGgnLFxuICAgICAgICAnQHRpcHRhcC9leHRlbnNpb24tYm9sZCcsXG4gICAgICAgICdAdGlwdGFwL2V4dGVuc2lvbi1pdGFsaWMnLFxuICAgICAgICAnQHRpcHRhcC9leHRlbnNpb24tYmxvY2txdW90ZScsXG4gICAgICAgICdAc29saWQtcHJpbWl0aXZlcy91cGxvYWQnLFxuICAgICAgICAnQHRpcHRhcC9leHRlbnNpb24tcGxhY2Vob2xkZXInLFxuICAgICAgICAncHJvc2VtaXJyb3ItdmlldycsXG4gICAgICAgICdAdGlwdGFwL2V4dGVuc2lvbi1saW5rJyxcbiAgICAgICAgJ0B0aXB0YXAvZXh0ZW5zaW9uLWltYWdlJyxcbiAgICAgICAgJ0B0aXB0YXAvZXh0ZW5zaW9uLWNoYXJhY3Rlci1jb3VudCcsXG4gICAgICAgICdjbHN4JyxcbiAgICAgIF0sXG4gICAgfSxcbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlMsT0FBTyxlQUFlO0FBQ25VLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxpQkFBaUI7QUFFeEIsSUFBTSxlQUFlLE1BQU07QUFDekIsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLElBQ1AsZ0JBQWdCLFNBQVM7QUFDdkIsWUFBTSxFQUFFLFFBQVEsSUFBSTtBQUVwQixjQUFRLFFBQVEsQ0FBQyxXQUFXO0FBQzFCLFlBQUksT0FBTyxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQ3RDLGlCQUFPLGtCQUFrQjtBQUFBLFFBQzNCO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU0sY0FBYztBQUVwQixJQUFNLHVCQUF1QixDQUFDLGFBQTZCO0FBQ3pELFNBQU8sU0FDSixNQUFNLFNBQVMsUUFBUSxXQUFXLElBQUksWUFBWSxNQUFNLEVBQ3hELFFBQVEsZ0JBQWdCLEVBQUUsRUFDMUIsUUFBUSxXQUFXLEdBQUc7QUFDM0I7QUFFQSxJQUFNLHdCQUF3QixDQUFDLE1BQWMsVUFBa0IsU0FDN0QsR0FBRyxxQkFBcUIsUUFBUSxDQUFDLEtBQUssSUFBSTtBQUU1QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLE1BQU0sUUFBUSxNQUFNO0FBQ2pELFFBQU0sVUFBVTtBQUFBLElBQ2QsWUFBWSxFQUFFLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFDekIsVUFBVSxFQUFFLCtCQUErQixLQUFLLENBQUM7QUFBQSxJQUNqRCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZjtBQUVBLE1BQUksWUFBWSxTQUFTO0FBQ3ZCLFlBQVEsS0FBSyxPQUFPLENBQUM7QUFBQSxFQUN2QjtBQUVBLFFBQU0sUUFBUSxTQUFTO0FBRXZCLFNBQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gsY0FBYztBQUFBLE1BQ2QscUJBQXFCO0FBQUEsUUFDbkIsTUFBTSxFQUFFLGdCQUFnQixrQ0FBa0M7QUFBQSxNQUM1RDtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1Asb0JBQW9CLFFBQVEsd0JBQXdCO0FBQUEsTUFDdEQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxlQUFlO0FBQUEsUUFDYixVQUFVLENBQUM7QUFBQSxNQUNiO0FBQUEsTUFDQSx1QkFBdUI7QUFBQSxNQUN2QixRQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gsWUFBWTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
