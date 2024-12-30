import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare } from "lucide-react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/shared/Loader";
import { useNavigate } from "react-router-dom";
export const SignIn: React.FC = () => {
  const { toast } = useToast();
  const { checkAuthInputs, login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = await checkAuthInputs(data, "signin");
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
    await login(data, navigate, toast);
  };
  const signin = useGoogleLogin({
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
        await login(
          {
            firstname: resp.data.given_name,
            lastname: resp.data.family_name,
            email: resp.data.email,
            avatar: resp.data.picture,
            type: "passwordless",
          },
          navigate,
          toast
        );
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white">
        <div className="max-w-lg">
          <div className="flex items-center space-x-3 mb-12">
            <MessageSquare className="w-10 h-10" />
            <span className="text-2xl font-bold">ChatApp</span>
          </div>
          <h1 className="text-4xl font-bold mb-6 overflow-y-hidden">
            Connect and collaborate from anywhere
          </h1>
          <p className="text-lg text-indigo-100 mb-8">
            Join millions of people who organize their communications with
            ChatApp's secure platform.
          </p>
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
            alt="Collaboration"
            className="rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold">ChatApp</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 overflow-y-hidden">
            Sign in
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Welcome back! Please enter your details.
          </p>

          <button
            onClick={() => signin()}
            className="w-full flex items-center justify-center px-4 py-3 border-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 mb-6 transition-colors"
          >
            <Mail className="w-5 h-5 mr-3" />
            Sign in with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSignin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={data.email}
                className="w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                value={data.password}
                className="w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-2 border-gray-300"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full disabled:brightness-75 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 flex justify-center items-center bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {isLoading ? <Loading w={"w-[30%]"} color="white" /> : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign up for free
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
