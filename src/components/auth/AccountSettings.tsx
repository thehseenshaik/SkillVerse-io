/**
 * Account Settings Page
 * Comprehensive account management with profile update, password change, email change, and account deletion
 */

import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldAlert,
  Trash2,
  Globe,
  Bell,
  Lock,
  Download,
  LogOut,
  Monitor,
  Moon,
  Sun,
  RefreshCw,
  Link as LinkIcon,
  Clock,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { useAuth } from "@/lib/auth-context";
import {
  changePassword,
  changeEmail,
  deleteAccount,
  signOut,
} from "@/services/auth.service";
import { changePasswordSchema, updateEmailSchema } from "@/lib/validation/auth";
import { toast } from "sonner";
import { applyTheme, getStoredTheme, type ThemeMode } from "@/lib/theme";
import { Switch } from "@/components/ui/switch";
import { usePlatformStore } from "@/lib/platform-store";
import { Link } from "@tanstack/react-router";

type Tab = "appearance" | "security" | "notifications" | "privacy" | "connections" | "danger";

export function AccountSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("appearance");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { github, leetcode, githubData, leetcodeData, syncGitHub, syncLeetCode, disconnectGitHub, disconnectLeetCode, isSyncing } = usePlatformStore();

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = changePasswordSchema.safeParse(passwordData);
      if (!result.success) {
        toast.error("Please fix the errors in the form");
        return;
      }

      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = updateEmailSchema.safeParse(emailData);
      if (!result.success) {
        toast.error("Please fix the errors in the form");
        return;
      }

      await changeEmail(emailData.newEmail, emailData.password);
      toast.success(
        "Email change initiated. Please check your new email for verification.",
      );
      setEmailData({ newEmail: "", password: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) {
      toast.error("Please confirm that you want to delete your account");
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success("Account deleted successfully");
      navigate({ to: "/", replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate({ to: "/", replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  const handleDownloadData = () => {
    toast.info("Data download feature coming soon");
  };

  const handleThemeChange = (theme: ThemeMode) => {
    applyTheme(theme);
    toast.success(`Theme changed to ${theme}`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
      </div>

      <div className="glass rounded-3xl shadow-elegant overflow-hidden">
        {/* Header */}
        <div className="border-b border-border/70 p-6">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-border/70 p-4">
            <nav className="space-y-1">
              <TabButton
                active={activeTab === "appearance"}
                onClick={() => setActiveTab("appearance")}
                icon={<Monitor className="h-4 w-4" />}
                label="Appearance"
              />
              <TabButton
                active={activeTab === "security"}
                onClick={() => setActiveTab("security")}
                icon={<ShieldAlert className="h-4 w-4" />}
                label="Security"
              />
              <TabButton
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
                icon={<Bell className="h-4 w-4" />}
                label="Notifications"
              />
              <TabButton
                active={activeTab === "privacy"}
                onClick={() => setActiveTab("privacy")}
                icon={<Lock className="h-4 w-4" />}
                label="Privacy"
              />
              <TabButton
                active={activeTab === "connections"}
                onClick={() => setActiveTab("connections")}
                icon={<LinkIcon className="h-4 w-4" />}
                label="Connections"
              />
              <TabButton
                active={activeTab === "danger"}
                onClick={() => setActiveTab("danger")}
                icon={<Trash2 className="h-4 w-4" />}
                label="Danger Zone"
              />
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === "appearance" && (
              <AppearanceTab onThemeChange={handleThemeChange} />
            )}
            {activeTab === "security" && (
              <SecurityTab
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                emailData={emailData}
                setEmailData={setEmailData}
                showCurrentPassword={showCurrentPassword}
                setShowCurrentPassword={setShowCurrentPassword}
                showNewPassword={showNewPassword}
                setShowNewPassword={setShowNewPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                onPasswordChange={handlePasswordChange}
                onEmailChange={handleEmailChange}
                isSubmitting={isSubmitting}
              />
            )}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "privacy" && <PrivacyTab />}
            {activeTab === "connections" && (
              <ConnectionsTab
                github={github}
                leetcode={leetcode}
                githubData={githubData}
                leetcodeData={leetcodeData}
                onSyncGitHub={() => user?.id && syncGitHub(user.id)}
                onSyncLeetCode={() => user?.id && syncLeetCode(user.id)}
                onDisconnectGitHub={() => user?.id && disconnectGitHub(user.id)}
                onDisconnectLeetCode={() => user?.id && disconnectLeetCode(user.id)}
                isSyncing={isSyncing}
              />
            )}
            {activeTab === "danger" && (
              <DangerTab
                deletePassword={deletePassword}
                setDeletePassword={setDeletePassword}
                deleteConfirmed={deleteConfirmed}
                setDeleteConfirmed={setDeleteConfirmed}
                onDelete={handleDeleteAccount}
                onLogout={handleLogout}
                onDownloadData={handleDownloadData}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-brand/10 text-brand"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function AppearanceTab({
  onThemeChange,
}: {
  onThemeChange: (theme: ThemeMode) => void;
}) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    setCurrentTheme(getStoredTheme());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize your application experience
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-3 font-medium">Theme</h3>
          <div className="grid grid-cols-3 gap-3">
            <ThemeCard
              icon={<Sun className="h-5 w-5" />}
              label="Light"
              value="light"
              current={currentTheme}
              onSelect={() => {
                setCurrentTheme("light");
                onThemeChange("light");
              }}
            />
            <ThemeCard
              icon={<Moon className="h-5 w-5" />}
              label="Dark"
              value="dark"
              current={currentTheme}
              onSelect={() => {
                setCurrentTheme("dark");
                onThemeChange("dark");
              }}
            />
            <ThemeCard
              icon={<Monitor className="h-5 w-5" />}
              label="System"
              value="system"
              current={currentTheme}
              onSelect={() => {
                setCurrentTheme("system");
                onThemeChange("system");
              }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Reduced Motion</h3>
              <p className="text-sm text-muted-foreground">
                Minimize animations throughout the app
              </p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="rounded-lg border border-border/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Compact Mode</h3>
              <p className="text-sm text-muted-foreground">
                Use smaller spacing and fonts
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({
  icon,
  label,
  value,
  current,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  value: ThemeMode;
  current: ThemeMode;
  onSelect: () => void;
}) {
  const isSelected = current === value;
  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
        isSelected
          ? "border-brand bg-brand/10 text-brand"
          : "border-border bg-background text-muted-foreground hover:bg-secondary/60"
      }`}
    >
      {isSelected && (
        <div className="absolute right-2 top-2">
          <Check className="h-4 w-4" />
        </div>
      )}
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function SecurityTab({
  passwordData,
  setPasswordData,
  emailData,
  setEmailData,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onPasswordChange,
  onEmailChange,
  isSubmitting,
}: any) {
  return (
    <div className="space-y-8">
      {/* Password Change */}
      <div>
        <h2 className="text-lg font-semibold">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Update your password to keep your account secure
        </p>
        <form onSubmit={onPasswordChange} className="space-y-4">
          <PasswordField
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(v: string) =>
              setPasswordData((prev: any) => ({ ...prev, currentPassword: v }))
            }
            show={showCurrentPassword}
            setShow={setShowCurrentPassword}
          />
          <PasswordField
            label="New Password"
            value={passwordData.newPassword}
            onChange={(v: string) =>
              setPasswordData((prev: any) => ({ ...prev, newPassword: v }))
            }
            show={showNewPassword}
            setShow={setShowNewPassword}
          />
          <PasswordField
            label="Confirm New Password"
            value={passwordData.confirmNewPassword}
            onChange={(v: string) =>
              setPasswordData((prev: any) => ({
                ...prev,
                confirmNewPassword: v,
              }))
            }
            show={showConfirmPassword}
            setShow={setShowConfirmPassword}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>

      {/* Email Change */}
      <div className="border-t border-border/70 pt-8">
        <h2 className="text-lg font-semibold">Change Email</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Update your email address (requires verification)
        </p>
        <form onSubmit={onEmailChange} className="space-y-4">
          <FormField
            label="New Email"
            type="email"
            value={emailData.newEmail}
            onChange={(v: string) =>
              setEmailData((prev: any) => ({ ...prev, newEmail: v }))
            }
          />
          <PasswordField
            label="Current Password"
            value={emailData.password}
            onChange={(v: string) =>
              setEmailData((prev: any) => ({ ...prev, password: v }))
            }
            show={false}
            setShow={() => {}}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Change Email"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications
        </p>
      </div>
      <div className="space-y-4">
        <NotificationItem
          label="Email Notifications"
          description="Receive notifications via email"
        />
        <NotificationItem
          label="Push Notifications"
          description="Receive push notifications"
        />
        <NotificationItem
          label="Marketing Emails"
          description="Receive marketing and promotional emails"
        />
        <NotificationItem
          label="Security Alerts"
          description="Receive security-related notifications"
        />
        <NotificationItem
          label="Product Updates"
          description="Receive updates about new features"
        />
      </div>
    </div>
  );
}

function PrivacyTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Privacy Settings</h2>
        <p className="text-sm text-muted-foreground">
          Control your privacy and data sharing preferences
        </p>
      </div>
      <div className="space-y-4">
        <PrivacyItem
          label="Profile Visibility"
          description="Who can see your profile"
          options={["Public", "Private", "Connections Only"]}
        />
        <PrivacyItem
          label="Show Email"
          description="Display your email on your profile"
        />
        <PrivacyItem
          label="Show Location"
          description="Display your location on your profile"
        />
        <PrivacyItem
          label="Allow Messages"
          description="Allow others to send you messages"
        />
        <PrivacyItem
          label="Data Sharing"
          description="Allow sharing of anonymized data for analytics"
        />
      </div>
    </div>
  );
}

function DangerTab({
  deletePassword,
  setDeletePassword,
  deleteConfirmed,
  setDeleteConfirmed,
  onDelete,
  onLogout,
  onDownloadData,
  isSubmitting,
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Irreversible actions that affect your account
        </p>
      </div>

      <div className="space-y-4">
        {/* Download Data */}
        <div className="rounded-lg border border-border/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Download Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Get a copy of all your data
              </p>
            </div>
            <button
              onClick={onDownloadData}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/60"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>

        {/* Logout from all devices */}
        <div className="rounded-lg border border-border/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Logout from All Devices</h3>
              <p className="text-sm text-muted-foreground">
                Sign out from all active sessions
              </p>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/60"
            >
              <LogOut className="h-4 w-4" /> Logout All
            </button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <div className="mb-4">
            <h3 className="font-medium text-destructive">Delete Account</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <div className="space-y-4">
            <PasswordField
              label="Confirm Password"
              value={deletePassword}
              onChange={setDeletePassword}
              show={false}
              setShow={() => {}}
            />
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-background text-destructive focus:ring-destructive"
              />
              <span className="text-sm text-muted-foreground">
                I understand that this action is irreversible and all my data
                will be permanently deleted
              </span>
            </label>
            <button
              onClick={onDelete}
              disabled={isSubmitting || !deleteConfirmed}
              className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, type = "text", value, onChange }: any) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground transition-colors"
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, show, setShow }: any) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 focus-within:border-foreground">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full flex-1 bg-transparent text-sm text-foreground outline-none"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function NotificationItem({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 p-4">
      <div>
        <h3 className="font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button className="relative h-6 w-11 rounded-full bg-brand transition-colors">
        <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
      </button>
    </div>
  );
}

function PrivacyItem({
  label,
  description,
  options,
}: {
  label: string;
  description: string;
  options?: string[];
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 p-4">
      <div>
        <h3 className="font-medium">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {options ? (
        <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground">
          {options.map((opt) => (
            <option key={opt} value={opt.toLowerCase()}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <button className="relative h-6 w-11 rounded-full bg-brand transition-colors">
          <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
        </button>
      )}
    </div>
  );
}

function ConnectionsTab({
  github,
  leetcode,
  githubData,
  leetcodeData,
  onSyncGitHub,
  onSyncLeetCode,
  onDisconnectGitHub,
  onDisconnectLeetCode,
  isSyncing,
}: any) {
  const formatLastSynced = (date: string | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Platform Connections</h2>
        <p className="text-sm text-muted-foreground">
          Manage your GitHub and LeetCode integrations
        </p>
      </div>

      <div className="space-y-4">
        {/* GitHub Connection */}
        <div className="rounded-lg border border-border/70 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-border/60 bg-background">
                <FaGithub className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">GitHub</h3>
                  {github.connected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      Connected
                    </span>
                  )}
                </div>
                {github.connected && githubData ? (
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>@{github.username}</span>
                      <span>•</span>
                      <span>{githubData.profile.followers} followers</span>
                      <span>•</span>
                      <span>{githubData.repositories.length} repos</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Last synced: {formatLastSynced(github.lastSynced)}
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Not connected</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {github.connected ? (
                <>
                  <button
                    onClick={onSyncGitHub}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary/60 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                  <button
                    onClick={onDisconnectGitHub}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <Link
                  to="/connections"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
                >
                  Connect
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* LeetCode Connection */}
        <div className="rounded-lg border border-border/70 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-border/60 bg-background">
                <SiLeetcode className="h-5 w-5 text-[#FFA116]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">LeetCode</h3>
                  {leetcode.connected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      Connected
                    </span>
                  )}
                </div>
                {leetcode.connected && leetcodeData ? (
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>@{leetcode.username}</span>
                      <span>•</span>
                      <span>{leetcodeData.stats.All} solved</span>
                      <span>•</span>
                      <span>Rating: {leetcodeData.contest.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      Last synced: {formatLastSynced(leetcode.lastSynced)}
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Not connected</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {leetcode.connected ? (
                <>
                  <button
                    onClick={onSyncLeetCode}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary/60 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                  <button
                    onClick={onDisconnectLeetCode}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <Link
                  to="/connections"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
                >
                  Connect
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Auto-sync info */}
        <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-brand mt-0.5" />
            <div>
              <h3 className="font-medium">Automatic Sync</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your connected platforms automatically sync every 24 hours. You can also manually sync at any time using the Sync button above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
