"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, Phone, ShieldCheck, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "next/navigation";
import { useGetMeQuery } from "@/store/modules/user/userApi";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated } from "@/store/modules/auth/authSlice";
import { Skeleton } from "@/components/ui/skeleton"

// ===== Header Skeleton Loader =====
function AvatarSkeleton() {
  return (
    <Skeleton className="h-10 w-10 rounded-full" />
  )
}

// ===== Header =====
export function Header() {
   const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
    const pathname = usePathname();
    
    // Get authenticated user from Redux state
    const authUser = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    
    // Fetch user profile from API
    const { data: userDetail, isLoading } = useGetMeQuery(undefined, {
      skip: !isAuthenticated // Only fetch if user is authenticated
    });
    
    // Determine display name and profile picture
    const currentUser = {
      fullName: userDetail?.firstName 
        ? `${userDetail.firstName} ${userDetail.lastName || ""}`
        : authUser?.name ?? "User",
      profilePicture: userDetail?.avatarUrl || userDetail?.kyc?.avatarUrl,
    };
    
    // Determine which dashboard links to show based on user role
    const isAdmin = userDetail?.role === "ADMIN" || userDetail?.role === "COMMITTEE";
    const isMember = userDetail?.role === "MEMBER";
    const showAdminLink = (isAdmin && !pathname.startsWith("/admin")) || (!isAdmin && pathname.startsWith("/user"));
    const showUserLink = (!isAdmin && !pathname.startsWith("/user")) || (isAdmin && !pathname.startsWith("/admin"));
    
  


  const menuItems = (
    <>
      <Link href="#services" onClick={() => setIsMenuOpen(false)} className="hover:opacity-80">Services</Link>
      <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:opacity-80">About</Link>
      <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="hover:opacity-80">Contact</Link>
    </>
  );

  // Debug log
  console.log("Avatar URL:", currentUser.profilePicture, currentUser.fullName);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Company Name */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full overflow-hidden grid place-items-center">
            <Image 
              src="/logo.png" 
              alt="Shababul Khair Logo" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase font-serif sm:hidden md:block text-foreground">Shababul khair Halal investment Ltd</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-serif text-foreground">
          {menuItems}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="gap-2 font-serif text-foreground hover:bg-secondary" asChild>
            <Link href="tel:+23470306514101" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Call
            </Link>
          </Button>
          <ModeToggle />
        </div>
        
        {/* Authentication Section */}
        {isAuthenticated ? (
          <>
            {isLoading ? (
              <AvatarSkeleton />
            ) : (
              <>
                {/* Avatar Dropdown */}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="border border-border p-1 rounded-full cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                        <AvatarImage 
                          src={currentUser.profilePicture || ""} 
                          alt={currentUser.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                          crossOrigin="anonymous"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{currentUser.fullName?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-48 bg-background border border-border p-1 rounded-md shadow-md z-50">
                    <div className="px-3 py-2 text-sm font-medium text-foreground">
                      {currentUser.fullName}
                    </div>

                    <DropdownMenuSeparator className="bg-border" />

                    {/* Conditional dashboard links */}
                    {showAdminLink && (
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/admin/dashboard");
                          setDropdownOpen(false);
                        }}
                        className="flex gap-2 items-center px-3 py-2 hover:bg-secondary rounded cursor-pointer text-foreground"
                      >
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}

                    {showUserLink && (
                      <DropdownMenuItem
                        onClick={() => {
                          router.push("/user/dashboard");
                          setDropdownOpen(false);
                        }}
                        className="flex gap-2 items-center px-3 py-2 hover:bg-secondary rounded cursor-pointer text-foreground"
                      >
                        <User className="w-4 h-4 text-primary" />
                        User Dashboard
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="bg-border" />

                    <DropdownMenuItem
                      onClick={() => {
                        router.push("/user/profile");
                        setDropdownOpen(false);
                      }}
                      className="flex gap-2 items-center px-3 py-2 hover:bg-secondary rounded cursor-pointer text-foreground"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        router.push("/sign-in");
                        setDropdownOpen(false);
                      }}
                      className="flex gap-2 items-center px-3 py-2 text-destructive hover:bg-destructive/10 rounded cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </>
        ) : (
          <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/sign-in">
              Sign in
            </Link>
          </Button>
        )}

        {/* Mobile Menu & Theme Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="text-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-border">
              <nav className="flex flex-col gap-4 p-10 text-lg font-serif mt-8 text-foreground">
                {menuItems}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}