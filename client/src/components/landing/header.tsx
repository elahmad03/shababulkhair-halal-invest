"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// ===== Header =====
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const menuItems = (
    <>
      <Link href="#services" onClick={() => setIsMenuOpen(false)} className="hover:opacity-80">Services</Link>
      <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:opacity-80">About</Link>
      <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="hover:opacity-80">Contact</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Company Name */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full overflow-hidden grid place-items-center">
            <Image 
              src="/logo.png" 
              alt="lazy" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase font-serif sm:hidden md:block">Shababul khair Halal investment Ltd</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-serif">
          {menuItems}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="gap-2 font-serif" asChild>
            <Link href="tel:+23470306514101" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Call
            </Link>
          </Button>
          <ModeToggle />
        </div>

        {/* Mobile Menu & Theme Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 p-10 text-lg font-serif mt-8">
                {menuItems}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}