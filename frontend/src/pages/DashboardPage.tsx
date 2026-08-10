import { Link } from "react-router-dom";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { useLearningSession } from "../hooks/useLearningSession";

export function DashboardPage() {
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
        <p className="mx-auto max-w-6xl px-4 pt-6 text-sm text-navy/70 sm:px-6">
          <Link to="/" className="text-teal underline-offset-2 hover:underline">
            EduCAPTCHA
          </Link>{" "}
          / dashboard
        </p>
        <AnalyticsDashboard latestSession={learningApi.latestSession} />
      </main>
      <Footer />
    </div>
  );
}
