'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Features", href: "/features" },
  { name: "Courses", href: "/courses" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
      <nav className="flex items-center justify-between p-4 sm:p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            OnlineCourse
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="touch-manipulation"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] p-0 flex flex-col">
              <SheetHeader className="px-4 sm:px-6 py-4 border-b shrink-0">
                <SheetTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  OnlineCourse
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 px-3 sm:px-4 py-4 overflow-y-auto">
                  <div className="space-y-1">
                    {navigation.map((item) => (
                      <SheetClose key={item.name} asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center w-full px-4 py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors touch-manipulation ${
                            pathname === item.href
                              ? "bg-accent text-primary"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
                          }`}
                        >
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  {session ? (
                    <div className="space-y-1">
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className={`flex items-center w-full px-4 py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors touch-manipulation ${
                            pathname === "/dashboard"
                              ? "bg-accent text-primary"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
                          }`}
                        >
                          Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          onClick={() => signOut()}
                          className="w-full justify-start px-4 py-3 text-sm sm:text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 touch-manipulation"
                        >
                          Log out
                        </Button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          onClick={() => signIn("google")}
                          className="w-full justify-start px-4 py-3 text-sm sm:text-base font-semibold text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 touch-manipulation"
                        >
                          Log in
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          asChild
                          className="w-full px-4 py-3 text-sm sm:text-base font-semibold touch-manipulation"
                        >
                          <Link href="/register">Get Started</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold leading-6 transition-colors relative group ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
              {pathname === item.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => signIn("google")}
                className="text-sm font-semibold leading-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </button>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
} 