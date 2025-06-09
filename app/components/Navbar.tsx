"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link.js";
import React, { useEffect } from "react";
import { checkAndAddUser } from "../actions";

const Navbar = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (email) {
      checkAndAddUser(email);
    }
  }, [email]);

  return (
    <div>
      <div className="bg-base-200/30 px-5 md:px-[10%] py-4">
        {isLoaded &&
          (isSignedIn ? (
            <>
              <div className="flex justify-between items-center">
                <div className="flex text-2xl items-center font-bold">
                  Exp<span className="text-accent">ensys</span>
                </div>
                <div className="md:flex hidden">
                  <Link href={"/budgets"} className="btn">
                    Mes budgets
                  </Link>
                  <Link href={"/dashboard"} className="btn mx-4">
                    Tableau de Bord
                  </Link>
                  <Link href={"/transactions"} className="btn">
                    Mes Transactions
                  </Link>
                </div>
                <UserButton />
              </div>

              <div className="md:hidden flex mt-2 justify-center">
                <Link href={"/budgets"} className="btn btn-sm">
                  Mes budgets
                </Link>
                <Link href={"/dashboard"} className="btn btn-sm mx-4">
                  Tableau de Bord
                </Link>
                <Link href={"/transactions"} className="btn btn-sm">
                  Mes Transactions
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex text-2xl items-center font-bold">
                Exp<span className="text-accent">ensys</span>
              </div>
              <div className="flex mt-2 justify-center">
                <Link href={"/sign-in"} className="btn btn-sm">
                  Se connecter
                </Link>
                <Link href={"/sign-up"} className="btn btn-sm mx-4 btn-accent">
                  S&rsquo;inscrire
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Navbar;
