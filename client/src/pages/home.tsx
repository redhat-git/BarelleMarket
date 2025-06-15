import { useAuth } from "@/hooks/useAuth";
import Landing from "./landing";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  // For authenticated B2B users, we can show the same landing page
  // but with personalized content or redirect to a dashboard
  // For now, we'll show the landing page to everyone
  return <Landing />;
}
