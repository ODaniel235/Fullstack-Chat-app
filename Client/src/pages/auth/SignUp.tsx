import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import Loading from "@/components/shared/Loader";
export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(false);
  const { toast } = useToast();
  const { checkAuthInputs, signup, isLoading } = useAuthStore();
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>,
    type: string
  ) => {
    e.preventDefault();
    const error = await checkAuthInputs(data);
    if (error) {
      if (error.length > 1) {
        toast({
          title: "Error",
          description: error[0],
          variant: "destructive",
        });
        return;
      } else {
        toast({ title: "Error", description: error, variant: "destructive" });
        return;
      }
    }
    await signup(data, navigate, toast);
  };
  const login = useGoogleLogin({
    onSuccess: async (res) => {
      console.log("Token==>", res.access_token);
      try {
        const resp = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${res.access_token}`,
            },
          }
        );
        console.log("Decoded token info ==>", resp);
        signup({
          firstname: resp.data.given_name,
          lastname: resp.data.family_name,
          email: resp.data.email,
          avatar: resp.data.picture,
          type: "passwordless",
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <div className="min-h-screen flex ">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 p-12 text-white ">
        <div className="max-w-lg">
          <div className="flex items-center space-x-3 mb-12">
            <MessageSquare className="w-10 h-10" />
            <span className="text-2xl font-bold">ChatApp</span>
          </div>
          <h1 className="text-4xl font-bold mb-6 overflow-y-hidden">
            Start chatting with your team today
          </h1>
          <p className="text-lg text-purple-100 mb-8">
            Experience seamless communication with voice, video, and instant
            messaging all in one place.
          </p>
          <img
            src="https://images.unsplash.com/photo-1522071901873-411886a10004?w=800"
            alt="Team Collaboration"
            className="rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold">ChatApp</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 overflow-y-hidden">
            Create your account
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Get started with ChatApp today.
          </p>

          <button
            onClick={() => login()}
            className="w-full flex items-center justify-center px-4 py-3 border-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 mb-6 transition-colors"
          >
            <Mail className="w-5 h-5 mr-3" />
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                or sign up with email
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => handleSignup(e, "password")}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First name
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  name="firstname"
                  value={data.firstname}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  name="lastname"
                  value={data.lastname}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                name="email"
                value={data.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Create a password"
              />
            </div>

            <div className="flex items-center text-sm">
              <input
                onChange={() => setAgreement((prev) => !prev)}
                type="checkbox"
                className="rounded border-2 border-gray-300 mr-2"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-purple-600 hover:text-purple-500">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-purple-600 hover:text-purple-500">
                  Privacy Policy
                </a>
              </span>
            </div>

            <button
              disabled={!agreement || isLoading}
              type="submit"
              className=" overflow-y-hidden w-full bg-purple-600 text-white flex justify-center items-center py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:brightness-75 disabled:hover:bg-purple-600 disabled:cursor-not-allowed  "
            >
              {isLoading ? (
                <Loading color="white" w={"w-[30%]"} />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
