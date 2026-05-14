import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [displayName, setDisplayName] = useState("");

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          navigate("/auth");
          return;
        }
        setUser(session.user);
        setTimeout(() => fetchProfile(session.user.id), 0);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
    }
    setLoading(false);
  };

  const getInitial = () => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 2MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null));
      toast({ title: "Avatar updated" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);
      if (error) throw error;
      setProfile((prev) => (prev ? { ...prev, display_name: displayName } : null));
      toast({ title: "Profile saved" });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });
      if (signInError) throw new Error("Current password is incorrect.");
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      toast({ title: "Password updated" });
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Password change failed", description: error.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="mb-8 text-2xl font-semibold text-foreground">Profile settings</h1>

          <div className="mb-8 flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 bg-foreground">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Profile" />}
                <AvatarFallback className="bg-foreground text-primary-foreground text-2xl font-medium">
                  {getInitial()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input value="••••••••" disabled className="flex-1 bg-muted" />
                <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                  Change
                </Button>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
