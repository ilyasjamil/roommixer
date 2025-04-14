"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserAuth } from "../context/AuthContext";

const AuthCheck = ({ children }) => {
    const { user } = UserAuth();
    const router = useRouter();
    const pathname = usePathname();

    // useEffect(() => {
    //     console.log(pathname);
    //     if (!user) {
    //         router.push("/");
    //     }

    // }, [user, pathname, router]);

    // Show loading indicator or placeholder while checking auth state


    // Show children only if authenticated or on the intro page
    if (user || pathname === "/") {
        return children;
    }

    return null;
};

export default AuthCheck;