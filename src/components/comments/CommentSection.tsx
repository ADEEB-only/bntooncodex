 import { useState, useEffect, useCallback } from "react";
 import { EmailLogin } from "./EmailLogin";
 import { CommentList } from "./CommentList";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { Loader2, Send, LogOut, MessageCircle } from "lucide-react";
 import { useToast } from "@/hooks/use-toast";
 import { supabase } from "@/integrations/supabase/client";
 import type { User } from "@supabase/supabase-js";
 
 interface CommentSectionProps {
   seriesId: string;
   chapterId?: string;
 }
 
 export function CommentSection({
   seriesId,
   chapterId,
 }: CommentSectionProps) {
   const [user, setUser] = useState<User | null>(null);
   const [content, setContent] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [refreshKey, setRefreshKey] = useState(0);
   const { toast } = useToast();
 
   useEffect(() => {
     let isMounted = true;
     supabase.auth.getSession().then(({ data }) => {
       if (isMounted) {
         setUser(data.session?.user ?? null);
       }
     });

     const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
       setUser(session?.user ?? null);
     });

     return () => {
       isMounted = false;
       subscription.subscription.unsubscribe();
     };
   }, []);
 
   const handleAuth = useCallback((authUser: User) => {
     setUser(authUser);
   }, []);
 
   const handleLogout = () => {
     supabase.auth.signOut();
     setUser(null);
   };

   const getDisplayName = useCallback((authUser: User) => {
     return (
       (authUser.user_metadata?.full_name as string | undefined) ||
       authUser.email?.split("@")[0] ||
       "User"
     );
   }, []);
 
   const handleSubmit = async () => {
     if (!content.trim() || !user) return;

     setIsSubmitting(true);
     try {
       const session = await supabase.auth.getSession();
       const accessToken = session.data.session?.access_token;
       if (!accessToken) {
         toast({
           title: "Login required",
           description: "Please sign in to post a comment.",
           variant: "destructive",
         });
         setIsSubmitting(false);
         return;
       }

       const response = await fetch(
         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/comments`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${accessToken}`,
           },
           body: JSON.stringify({
             seriesId,
             chapterId: chapterId || null,
             content: content.trim(),
           }),
         }
       );
 
       if (response.ok) {
         setContent("");
         setRefreshKey((k) => k + 1);
         toast({
           title: "Comment posted!",
           description: "Your comment has been added.",
         });
       } else {
         const error = await response.json();
         toast({
           title: "Failed to post comment",
           description: error.error || "Please try again.",
           variant: "destructive",
         });
       }
     } catch (error) {
       toast({
         title: "Error",
         description: "Failed to post comment. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   return (
     <section className="mt-12 pt-8 border-t border-border">
       <div className="flex items-center gap-3 mb-6">
         <div className="w-1 h-6 bg-primary rounded-full" />
         <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
           <MessageCircle className="h-5 w-5" />
           Comments
         </h2>
       </div>
 
       {/* Auth / Comment Form */}
       <div className="bg-card rounded-xl border border-border p-6 mb-6">
         {user ? (
           <div className="space-y-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                   {getDisplayName(user).charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <p className="font-medium text-foreground">{getDisplayName(user)}</p>
                 </div>
               </div>
               <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                 <LogOut className="h-4 w-4" />
                 Logout
               </Button>
             </div>
 
             <Textarea
               placeholder="Write a comment..."
               value={content}
               onChange={(e) => setContent(e.target.value)}
               className="min-h-[100px] resize-none"
               maxLength={2000}
             />
 
             <div className="flex items-center justify-between">
               <span className="text-xs text-muted-foreground">
                 {content.length}/2000
               </span>
               <Button
                 onClick={handleSubmit}
                 disabled={!content.trim() || isSubmitting}
                 className="gap-2"
               >
                 {isSubmitting ? (
                   <Loader2 className="h-4 w-4 animate-spin" />
                 ) : (
                   <Send className="h-4 w-4" />
                 )}
                 Post Comment
               </Button>
             </div>
           </div>
         ) : (
           <EmailLogin onAuth={handleAuth} />
         )}
       </div>
 
       {/* Comments List */}
       <CommentList
         seriesId={seriesId}
         chapterId={chapterId}
         refreshKey={refreshKey}
          currentUser={user}
          onReplySubmitted={() => setRefreshKey((k) => k + 1)}
       />
     </section>
   );
 }
