import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FeedbackProvider } from "./components/common/Feedback";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <FeedbackProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </FeedbackProvider>
    </BrowserRouter>
  );
}

export default App;
