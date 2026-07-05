'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { User } from 'lucide-react'
import NavItems from './NavItems'
import MobileNav from './MobileNav'

const header = () => {
    const { isSignedIn } = useUser()

    return (
        <header className="w-full border-b">
            <div className="wrapper flex items-center justify-between">
                <Link href="/" className="w-36">
                    <Image src="/assets/images/logo.svg" width={128} height={38} alt="Evently Logo" />
                </Link>

                {isSignedIn && 
                <nav className="md: flex-between hidden w-full max-w-xs">
                    <NavItems />
                </nav>
                }

                <div className="flex w-32 justify-end gap-4">
                    {isSignedIn ? (
                        <>
                            <UserButton />
                            <MobileNav />
                        </>
                    ) : (
                        <Button asChild className="rounded-full" size="lg">
                            <Link href="/sign-in">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default header