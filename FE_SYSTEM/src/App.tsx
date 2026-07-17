import AppInit from "@/app/init/AppInit";
import AntdProvider from "@/app/providers/antd/AntdProvider";
import ThemeProvider from "@/app/providers/theme/ThemeProvider";
import { store } from "@/app/redux/store";
import { router } from "@/app/router/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

function App() {
   const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider>
        <AntdProvider>
          <AppInit>
          <RouterProvider router={router} />
          </AppInit>
        </AntdProvider>
      </ThemeProvider>
    </Provider>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
export default App;
