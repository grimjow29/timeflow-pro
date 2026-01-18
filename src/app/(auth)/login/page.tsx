import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surfaceHighlight via-background to-background">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <LoginForm />
    </div>
  );
}
