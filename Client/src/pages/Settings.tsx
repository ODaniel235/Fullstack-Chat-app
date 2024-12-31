import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, User, Palette, Lock, Camera, Upload } from "lucide-react";
import { OTPModal } from "../components/modals/OTPModal";
import { ChangePasswordModal } from "../components/modals/ChangePasswordModal";
import useAuthStore from "@/store/useAuthStore";
import useThemeStore from "@/store/useThemeStore";

export const Settings: React.FC = () => {
  const { userData } = useAuthStore();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
  const handleImageUpdate = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {};
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
    console.log(e.target.value);
    changeThemes(e.target.value);
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
                  src={
                    userData?.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                  }
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
                <button className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white">
                  <Upload className="w-4 h-4" />
                </button>
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
              /* 
              value={"Select theme"} */
              onChange={changeTheme}
              className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
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
                checked={userData?.privacySettings?.showOnlineStatus}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>Read Receipts</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userData?.privacySettings?.readReceipts}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Photo Visibility
            </label>
            <select className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
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
