import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface EmailLoginProps {
  onAuth: (user: User) => void;
}

export function EmailLogin({ onAuth }: EmailLoginProps) {
  const onAuthRef = useRef(onAuth);
  onAuthRef.current = onAuth;

  const handleClick = useCallback(async () => {
    try {
      const email = window.prompt("Enter your email address");
      if (!email) return;
      const password = window.prompt("Enter your password (leave blank for magic link)") ?? "";

      if (password.trim()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Supabase auth error:", error);
          window.alert("Login failed. Please check your credentials.");
          return;
        }

        if (data.user) {
          onAuthRef.current(data.user);
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });

        if (error) {
          console.error("Supabase magic link error:", error);
          window.alert("Unable to send magic link. Please try again.");
          return;
        }

        window.alert("Check your email for the magic link to finish signing in.");
      }
    } catch (error) {
      console.error("Failed to sign in:", error);
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={handleClick} variant="outline" size="lg" className="gap-2">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.17.331.015.098.034.322.019.496z" />
        </svg>
        Login with Email
      </Button>
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Login with Email to comment
      </p>
    </div>
  );
}

export function EmailLoginButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="outline" className="gap-2">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.234.17.331.015.098.034.322.019.496z" />
      </svg>
      Login with Email
    </Button>
  );
}
