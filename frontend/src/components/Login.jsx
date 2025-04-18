import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import React, { useState } from "react";
import { toast } from "react-toastify";
import SigninWithGoogle from "./signinWithGoogle";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Login clicked", email, password);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful");
            toast.success("Login successful", {
                position: "top-center",
                autoClose: 4000,
            });
            window.location.href = "/summarizer";
        } catch (error) {
            console.log(error);
            toast.error(error.message, {
                position: "bottom-center",
                autoClose: 4000,
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
            >
                <h3 className="text-2xl font-semibold mb-6 text-center">Login</h3>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email address</label>
                    <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Submit
                </button>

                <p className="mt-4 text-center text-sm text-gray-600">
  New user?{" "}
  <a
    href="/register"
    className="text-blue-600 font-medium hover:underline transition duration-150 ease-in-out"
  >
    Register Here
  </a>
</p>

                <SigninWithGoogle />
            </form>
        </div>
    );
}

export default Login;
