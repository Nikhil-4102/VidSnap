import { GoogleAuthProvider , signInWithPopup} from "firebase/auth";
import React from "react";
import { auth } from "./firebase";
import { toast } from "react-toastify";

import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";


function SignWithGoogle() {

  const GoogleLoginIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).then(async(result) => {
            console.log(result);
            const user = result.user;
            if (result.user) {
                await setDoc(doc(db, "users", user.uid), {
                                    firstName: user.displayName,
                                    
                                    email:user.email,
                                    
                                });

                toast.success("User logged in successfully", {
                    position: "top-center",
                    autoClose: 4000,
                });
                window.location.href = "https://flaskyt-production.up.railway.app/summarizer";
            }

  });
}

  return (
    <div className="mt-6 text-center">
      <p className="text-gray-500 mb-4 text-sm">-- Or continue with --</p>
      <button
        onClick={GoogleLoginIn}
        className="inline-block hover:scale-105 transition-transform"
      >
        <img
          src={require("./img.png")}
          alt="Google Sign-In"
          className="w-36 h-auto mx-auto"
        />
      </button>
    </div>
  );
}

export default SignWithGoogle;
