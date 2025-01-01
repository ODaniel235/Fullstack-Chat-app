import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, User, Palette, Lock, Camera, Upload } from "lucide-react";
import { OTPModal } from "../components/modals/OTPModal";
import { ChangePasswordModal } from "../components/modals/ChangePasswordModal";
import useAuthStore from "@/store/useAuthStore";
import useThemeStore from "@/store/useThemeStore";
import { useToast } from "@/hooks/use-toast";

export const Settings: React.FC = () => {
  const { userData, updateData, handleFileUpload } = useAuthStore();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { toast } = useToast();

  const { changeThemes, theme } = useThemeStore();
  const [basics, setBasics] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });
  const [otpAction, setOtpAction] = useState<
    "password" | "twoFactor" | "delete" | null
  >(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleOTPAction = (action: "password" | "twoFactor" | "delete") => {
    setOtpAction(action);
    setShowOTPModal(true);
  };

  const handleOTPVerified = () => {
    setShowOTPModal(false);
    if (otpAction === "password") {
      setShowPasswordModal(true);
    } else if (otpAction === "twoFactor") {
      setTwoFactorEnabled(!twoFactorEnabled);
    }
  };
  const handleImageUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, "Profile", toast);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBasics((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    console.log(basics);
  };
  const changeTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeThemes(e.target.value, toast);
    updateData({ theme: e.target.value }, toast);
  };
  const handleUpdate = async (basic?: boolean, value?: any, data?: any) => {
    if (basic) {
      if (!basics.firstName && !basics.lastName && !basics.bio) {
        return toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill required fields before saving",
        });
      } else {
        await updateData(basics, toast);
      }
    }
    await updateData({ [value]: data }, toast);
    console.log({ [value]: data });
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-2xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Personal Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <User className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Personal Information</h2>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg ">
              <button className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full text-white">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="relative -mt-16 ml-6 flex items-end space-x-4">
              <label
                htmlFor="uploadImage"
                className="relative hover:cursor-pointer"
              >
                <img
                  src={userData?.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800"
                />{" "}
                <input
                  onChange={(e) => handleImageUpdate(e, "profile")}
                  type="file"
                  accept="image/*"
                  id="uploadImage"
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="uploadImage"
                  className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white"
                >
                  <Upload className="w-4 h-4" />
                </label>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                onChange={handleChange}
                name="firstName"
                type="text"
                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                onChange={handleChange}
                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 h-24 resize-none"
              name="bio"
              onChange={handleChange}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
        <AnimatePresence>
          {(basics.firstName || basics.lastName || basics.bio) && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={() => handleUpdate(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update Changes
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Personalization Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Personalization</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              onChange={changeTheme}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              <option selected={theme == "light"} value="light">
                Light
              </option>
              <option selected={theme == "dark"} value="dark">
                Dark
              </option>
              <option selected={theme == "system"} value="system">
                System
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Privacy</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Show Online Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={userData?.privacySettings?.showOnlineStatus}
                className="sr-only peer"
                name="status"
                onChange={(e) =>
                  handleUpdate(false, "status", e.target.checked)
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Read Receipts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={userData?.privacySettings?.readReceipts}
                className="sr-only peer"
                name="receipts"
                onChange={(e) =>
                  handleUpdate(false, "receipt", e.target.checked)
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Photo Visibility
            </label>
            <select
              name="visibility"
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              defaultValue={userData?.privacySettings.profileVisibility} // Bind the current value
              onChange={(e) =>
                handleUpdate(false, "visibility", e.target.value)
              } // Handle changes here
            >
              <option value="everyone">Everyone</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Lock className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Account Settings</h2>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => handleOTPAction("password")}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Change Password
          </button>
          <div className="flex items-center justify-between px-4 py-2">
            <span>Two-Step Verification</span>
            {userData?.twoFactorEnabled ? (
              <button
                onClick={() => handleOTPAction("twoFactor")}
                className="text-red-500 hover:text-red-600"
              >
                Turn Off
              </button>
            ) : (
              <button
                onClick={() => handleOTPAction("twoFactor")}
                className="text-blue-500 hover:text-blue-600"
              >
                Turn On
              </button>
            )}
          </div>
          <button
            onClick={() => handleOTPAction("delete")}
            className="w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showOTPModal && (
        <OTPModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          action={otpAction} /* 
          onVerified={handleOTPVerified} */
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </motion.div>
  );
};
