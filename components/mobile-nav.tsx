import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { title: "Features", href: "/features" },
  { title: "Courses", href: "/courses" },
  { title: "Pricing", href: "/pricing" },
  { title: "About", href: "/about" },
  { title: "Dashboard", href: "/dashboard" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
        <nav className="flex flex-col h-full">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">OnlineCourse</h2>
          </div>
          <div className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center w-full px-4 py-3 text-sm rounded-md transition-colors hover:bg-accent ${
                    pathname === item.href
                      ? "bg-accent font-medium"
                      : "hover:text-accent-foreground"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="px-6 py-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/logout">Log out</Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
} 