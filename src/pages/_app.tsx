import { AppProps } from "next/app"
import React from "react"
import { Header } from "../components/Header";
import '../styles/global.scss';
import { SessionProvider } from "next-auth/react";



import type { Session } from "next-auth"

function MyApp({ Component, pageProps: { session, ...pageProps } } : AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <Header/>
      <Component {...pageProps} />
    </SessionProvider>
  ) 
}

export default MyApp
