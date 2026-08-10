import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { IntegrationDemo } from "../components/IntegrationDemo";
import { Navbar } from "../components/Navbar";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { useLearningSession } from "../hooks/useLearningSession";

export function IntegrationPage() {
  const progressApi = useDemoProgress();
  const learningApi = useLearningSession();

  return (
    <div className="min-h-screen">
      <Navbar
        onReset={() => {
          progressApi.reset();
          learningApi.resetLearning();
        }}
      />
      <main>
        <p className="mx-auto max-w-6xl px-4 pt-6 text-sm text-navy/50 sm:px-6">
          <Link to="/" className="text-teal underline-offset-2 hover:underline">
            EduCAPTCHA
          </Link>{" "}
          / integration
        </p>
        <IntegrationDemo />
      </main>
      <Footer />
    </div>
  );
}
