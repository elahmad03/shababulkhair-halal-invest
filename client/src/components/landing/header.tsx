"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, Phone, ShieldCheck, User, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "next/navigation"
import { useGetMeQuery } from "@/store/modules/user/userApi"
import { useSelector } from "react-redux"
import { selectCurrentUser, selectIsAuthenticated } from "@/store/modules/auth/authSlice"
import { Skeleton } from "@/components/ui/skeleton"

function AvatarSkeleton() {
  return <Skeleton className="h-9 w-9 rounded-full" />
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
    
  const authUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
    
  const { data: userDetail, isLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated 
  })
    
  const currentUser = {
    fullName: userDetail?.firstName 
      ? `${userDetail.firstName} ${userDetail.lastName || ""}`
      : authUser?.name ?? "User",
    profilePicture: userDetail?.avatarUrl || userDetail?.kyc?.avatarUrl,
  }
    
  const isAdmin = userDetail?.role === "ADMIN" || userDetail?.role === "COMMITTEE"
  const showAdminLink = (isAdmin && !pathname.startsWith("/admin")) || (!isAdmin && pathname.startsWith("/user"))
  const showUserLink = (!isAdmin && !pathname.startsWith("/user")) || (isAdmin && !pathname.startsWith("/admin"))

  // Navigation Links definition for structural re-use
  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "#contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Section: Logo & Brand String */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-8 w-8 rounded-full overflow-hidden grid place-items-center bg-muted group-hover:opacity-90 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="Shababul Khair Logo" 
              width={32} 
              height={32} 
              className="rounded-full object-cover"
            />
          </div>
          {/* Prevent tablet collisions using break-points */}
          <span className="text-sm font-semibold tracking-wide uppercase font-serif hidden lg:block text-foreground selection:bg-primary/20">
            Shababul Khair Halal Investment Ltd
          </span>
          <span className="text-sm font-semibold tracking-wide uppercase font-serif lg:hidden text-foreground">
            Shababul Khair
          </span>
        </Link>

        {/* Center Section: Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium font-serif">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-200 ${
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Section: Action Controls Container */}
        <div className="flex items-center gap-4">
          
          {/* Desktop Only Call CTA */}
          <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground hover:bg-muted" asChild>
            <Link href="tel:+23470306514101">
              <Phone className="h-4 w-4" /> 
              <span>Call</span>
            </Link>
          </Button>

          {/* Desktop Only Mode Toggle */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {/* User Auth Section Layout-Shift Protection Wrapper */}
          <div className="flex items-center justify-end min-w-[40px]">
            {isAuthenticated ? (
              isLoading ? (
                <AvatarSkeleton />
              ) : (
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 select-none ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage 
                          src={currentUser.profilePicture || ""} 
                          alt={currentUser.fullName}
                          className="object-cover"
                          crossOrigin="anonymous"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                          {currentUser.fullName?.[0] ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-56 align-end p-1.5 border border-border bg-popover text-popover-foreground shadow-lg rounded-xl z-50" align="end">
                    <div className="px-2.5 py-2">
                      <p className="text-sm font-semibold truncate text-foreground">{currentUser.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">Logged in</p>
                    </div>

                    <DropdownMenuSeparator className="-mx-1.5 my-1 bg-border" />

                    {showAdminLink && (
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/admin/dashboard")
                          setDropdownOpen(false)
                        }}
                        className="flex gap-2.5 items-center px-2.5 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}

                    {showUserLink && (
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/user/dashboard")
                          setDropdownOpen(false)
                        }}
                        className="flex gap-2.5 items-center px-2.5 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        <User className="w-4 h-4 text-primary" />
                        <span>User Dashboard</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => {
                        router.push("/user/profile")
                        setDropdownOpen(false)
                      }}
                      className="flex gap-2.5 items-center px-2.5 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="-mx-1.5 my-1 bg-border" />

                    <DropdownMenuItem
                      onClick={() => {
                        router.push("/sign-in")
                        setDropdownOpen(false)
                      }}
                      className="flex gap-2.5 items-center px-2.5 py-2 text-sm rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <Button size="sm" className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Shell Menu Trigger */}
          <div className="md:hidden flex items-center gap-1.5">
            <ModeToggle />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="text-foreground hover:bg-muted h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-l border-border w-72 flex flex-col justify-between p-6">
                
                <div className="flex flex-col gap-6 mt-4">
                  <SheetHeader className="text-left">
                    <SheetTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase font-serif">
                      Navigation
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 text-base font-medium font-serif">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`py-1.5 border-b border-transparent transition-colors ${
                          pathname === link.href ? "text-primary" : "text-foreground/80 hover:text-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Mobile Bottom Context Menu (Fixes mobile functional disparity) */}
                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <Button variant="outline" size="default" className="w-full gap-2 text-foreground justify-center" asChild>
                    <Link href="tel:+23470306514101" onClick={() => setIsMenuOpen(false)}>
                      <Phone className="h-4 w-4 text-muted-foreground" /> Call Support
                    </Link>
                  </Button>

                  {!isAuthenticated && (
                    <Button size="default" className="w-full bg-primary text-primary-foreground justify-center font-medium" asChild>
                      <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                  )}
                </div>

              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  )
}