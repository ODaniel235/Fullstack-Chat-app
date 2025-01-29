import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, User, Palette, Lock, Camera, Upload } from "lucide-react";
import { OTPModal } from "../components/modals/OTPModal";
import { ChangePasswordModal } from "../components/modals/ChangePasswordModal";
import useAuthStore from "@/store/useAuthStore";
import useThemeStore from "@/store/useThemeStore";
import { useToast } from "@/hooks/use-toast";
import Avatar from "@/components/shared/Avatar";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import { useNavigate } from "react-router-dom";

export const Settings: React.FC = () => {
  const {
    userData,
    updateData,
    handleUpdateData,
    requestOtp,
    verifyOtp,
    deleteAccount,
  } = useAuthStore();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { changeThemes, theme } = useThemeStore();
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [basics, setBasics] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });
  const [otpAction, setOtpAction] = useState<
    "password" | "twoFactor" | "delete" | null
  >(null);

  const handleOTPAction = async (
    action: "password" | "twoFactor" | "delete"
  ) => {
    setOtpAction(action);
    setShowOTPModal(true);
    await requestOtp(action, toast);
  };

  const handleOTPVerified = () => {
    setShowOTPModal(false);
    if (otpAction === "password") {
      setShowOTPModal(false);
      setShowPasswordModal(true);
    } else {
      setDeleteAccountModal(true);
    }
  };
  const handleImageUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateData(e, toast);
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
  };
  const handleSubmit = async (onclose, otp) => {
    setOtpVerifying(true);
    const newOtp = parseInt(otp.join(""), 10);
    console.log(newOtp);
    const verifiedOtp = await verifyOtp(newOtp, otpAction, toast);
    setOtpVerifying(false);
    if (verifiedOtp) {
      handleOTPVerified();
    }
  };
  const handleAccountDelete = async () => {
    setIsDeletingAccount(true);
    await deleteAccount(navigate, toast);
    setIsDeletingAccount(false);
    setDeleteAccountModal(false);
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
                <Avatar
                  alt="profile"
                  avatar={userData.avatar}
                  name={userData.name}
                />
                <input
                  onChange={(e) => handleImageUpdate(e)}
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
          otpVerifying={otpVerifying}
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          handleSubmit={(onClose: Function, otp: string | number) =>
            handleSubmit(onClose, otp)
          }
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
      {deleteAccountModal && (
        <DeleteAccountModal
          handleDelete={handleAccountDelete}
          isOpen={deleteAccountModal}
          onClose={() => setDeleteAccountModal(false)}
          isDeleting={isDeletingAccount}
        />
      )}
    </motion.div>
  );
};
