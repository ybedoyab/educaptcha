import { Link } from "react-router-dom";
import { DemoSection } from "../components/DemoSection";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { useLearningSession } from "../hooks/useLearningSession";

export function PracticePage() {
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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="mb-4 text-sm text-navy/50">
          <Link to="/" className="text-teal underline-offset-2 hover:underline">
            EduCAPTCHA
          </Link>{" "}
          / practice
        </p>
        <DemoSection progressApi={progressApi} />
      </main>
      <Footer />
    </div>
  );
}
